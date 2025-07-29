<script lang="ts">
	import { browser } from '$app/environment'
	import {
		convertSessionsToCSV,
		type CSVValidationResult,
		downloadCSV,
		validateAndParseCSV,
	} from '$lib'
	import { breathingStorage } from '$lib/breathingStorage'

	// Export state
	let exporting = $state(false)
	let exportStatus = $state('')
	let sessionCount = $state(0)

	// Import state
	let importing = $state(false)
	let importStatus = $state('')
	let validationResult: CSVValidationResult | null = $state(null)
	let fileInput: HTMLInputElement | null = $state(null)
	let dragOver = $state(false)
	let importComplete = $state(false)

	async function handleExport() {
		if (!browser) return

		try {
			exporting = true
			exportStatus = 'Loading sessions...'

			const sessions = await breathingStorage.getAllSessions()
			sessionCount = sessions.length

			if (sessions.length === 0) {
				exportStatus = 'No sessions found to export'
				return
			}

			exportStatus = 'Generating CSV...'

			// Sort sessions by date (oldest first)
			sessions.sort(
				(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
			)

			const csvContent = convertSessionsToCSV(sessions)
			const timestamp = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
			const filename = `breathing-sessions-${timestamp}.csv`

			exportStatus = 'Downloading...'
			downloadCSV(csvContent, filename)

			exportStatus = `✓ Successfully exported ${sessions.length} sessions`
		} catch (error) {
			console.error('Export failed:', error)
			exportStatus = 'Export failed. Please try again.'
		} finally {
			exporting = false
		}
	}

	// Import functions
	async function handleFile(file: File) {
		if (!browser) return

		try {
			importStatus = 'Reading file...'
			validationResult = null
			importComplete = false

			if (!file.name.toLowerCase().endsWith('.csv')) {
				importStatus = 'Please select a CSV file'
				return
			}

			const text = await file.text()
			importStatus = 'Validating CSV...'

			const result = validateAndParseCSV(text)
			validationResult = result

			if (!result.isValid) {
				importStatus = 'CSV validation failed'
				return
			}

			if (result.sessions.length === 0) {
				importStatus = 'No valid sessions found in CSV'
				return
			}

			importStatus = `Found ${result.sessions.length} sessions ready to import`
			if (result.skippedRows > 0) {
				importStatus += ` (${result.skippedRows} rows skipped due to errors)`
			}
		} catch (error) {
			console.error('File processing error:', error)
			importStatus = 'Failed to read file'
			validationResult = null
		}
	}

	async function handleImport() {
		if (
			!browser ||
			!validationResult?.isValid ||
			!validationResult.sessions.length
		)
			return

		try {
			importing = true
			importStatus = 'Importing sessions...'

			const result = await breathingStorage.importSessions(
				validationResult.sessions,
			)

			if (result.errors.length > 0) {
				importStatus = `Import completed with ${result.errors.length} errors. ${result.imported} sessions imported.`
			} else {
				importStatus = `✓ Successfully imported ${result.imported} sessions`
			}

			importComplete = true
			validationResult = null

			// Clear the file input
			if (fileInput) {
				fileInput.value = ''
			}
		} catch (error) {
			console.error('Import failed:', error)
			importStatus = 'Import failed. Please try again.'
		} finally {
			importing = false
		}
	}

	function handleFileInput(event: Event) {
		const target = event.target as HTMLInputElement
		const file = target.files?.[0]
		if (file) {
			handleFile(file)
		}
	}

	function handleDrop(event: DragEvent) {
		event.preventDefault()
		dragOver = false

		const file = event.dataTransfer?.files[0]
		if (file) {
			handleFile(file)
		}
	}

	function handleDragOver(event: DragEvent) {
		event.preventDefault()
		dragOver = true
	}

	function handleDragLeave(event: DragEvent) {
		event.preventDefault()
		dragOver = false
	}

	function resetImport() {
		validationResult = null
		importStatus = ''
		importComplete = false
		if (fileInput) {
			fileInput.value = ''
		}
	}
</script>

<section>
	<h1>Settings</h1>

	<div class="export-section">
		<h2>Export Data</h2>

		<p>Export your practice data to a CSV file.</p>

		<button onclick={handleExport} disabled={exporting} class="export-button">
			{exporting ? 'Exporting...' : 'Export sessions to CSV'}
		</button>

		{#if exportStatus}
			<p
				class="status"
				class:success={exportStatus.includes('✓')}
				class:error={exportStatus.includes('failed')}
			>
				{exportStatus}
				{#if sessionCount > 0 && !exportStatus.includes('failed')}
					<br /><small>{sessionCount} total sessions</small>
				{/if}
			</p>
		{/if}
	</div>

	<div class="import-section">
		<h2>Import Data</h2>

		<p>
			Import practice data from a CSV file. Any existing sessions with the same
			start time will be overwritten with the new data.
		</p>

		<p>The CSV must exactly match the format of the exported data.</p>

		{#if !validationResult}
			<div
				class="upload-zone"
				class:drag-over={dragOver}
				role="button"
				tabindex="0"
				ondrop={handleDrop}
				ondragover={handleDragOver}
				ondragleave={handleDragLeave}
			>
				<div class="upload-content">
					<p>Drop CSV file here or</p>
					<input
						bind:this={fileInput}
						type="file"
						accept=".csv"
						onchange={handleFileInput}
						style="display: none"
					/>
					<button onclick={() => fileInput?.click()} class="select-file-button">
						Select File
					</button>
				</div>
			</div>
		{:else if validationResult.isValid}
			<div class="validation-success">
				<h4>✓ CSV Validation Successful</h4>
				<p>
					Found {validationResult.sessions.length} valid sessions
					{#if validationResult.skippedRows > 0}
						({validationResult.skippedRows} rows skipped due to errors)
					{/if}
				</p>

				{#if validationResult.errors.length > 0}
					<details>
						<summary>Warnings ({validationResult.errors.length})</summary>
						<ul class="error-list">
							<!-- eslint-disable-next-line svelte/require-each-key -->
							{#each validationResult.errors as error}
								<li>{error}</li>
							{/each}
						</ul>
					</details>
				{/if}

				<div class="action-buttons">
					<button
						onclick={handleImport}
						disabled={importing}
						class="import-button"
					>
						{importing
							? 'Importing...'
							: `Import ${validationResult.sessions.length} Sessions`}
					</button>
					<button onclick={resetImport} class="cancel-button"> Cancel </button>
				</div>
			</div>
		{:else}
			<div class="validation-error">
				<h4>❌ CSV Validation Failed</h4>
				<ul class="error-list">
					<!-- eslint-disable-next-line svelte/require-each-key -->
					{#each validationResult.errors as error}
						<li>{error}</li>
					{/each}
				</ul>
				<button onclick={resetImport} class="retry-button">
					Try Another File
				</button>
			</div>
		{/if}

		{#if importStatus}
			<p
				class="status"
				class:success={importStatus.includes('✓')}
				class:error={importStatus.includes('failed') ||
					importStatus.includes('Failed')}
			>
				{importStatus}
			</p>
		{/if}

		{#if importComplete}
			<div class="completion-actions">
				<a href="/history" class="view-history-button">View History</a>
				<button onclick={resetImport} class="import-another-button">
					Import Another File
				</button>
			</div>
		{/if}
	</div>
</section>

<style>
	section {
		padding: var(--size-4) var(--size-5);
		max-width: 600px;
	}

	h4 {
		color: inherit;
		margin-bottom: var(--size-2);
		font-size: var(--font-size-3);
	}

	.export-section {
		border-bottom: 1px solid var(--surface-4);
		padding-bottom: var(--size-5);
		margin-bottom: var(--size-4);
	}

	.import-section {
		padding-top: var(--size-2);
	}

	p {
		line-height: 1.6;
		margin-bottom: var(--size-4);
	}

	.export-button {
		background-color: var(--brand);
		border: none;
		border-radius: var(--radius-2);
		color: var(--surface-1);
		font-size: var(--font-size-3);
		font-weight: var(--font-weight-6);
		padding: var(--size-3) var(--size-4);
		cursor: pointer;
		transition: background-color 0.2s ease;
		margin-bottom: var(--size-4);
	}

	.export-button:hover:not(:disabled) {
		background-color: var(--brandAlt);
	}

	.export-button:disabled {
		background-color: var(--surface-4);
		cursor: not-allowed;
	}

	.status {
		font-weight: var(--font-weight-5);
		padding: var(--size-2) var(--size-3);
		border-radius: var(--radius-2);
		margin-bottom: var(--size-4);
	}

	.status.success {
		background-color: color-mix(in srgb, var(--brand) 20%, transparent);
		color: var(--brand);
	}

	.status.error {
		background-color: color-mix(in srgb, red 20%, transparent);
		color: red;
	}

	details {
		margin-top: var(--size-4);
	}

	summary {
		cursor: pointer;
		font-weight: var(--font-weight-5);
		color: var(--brand);
		margin-bottom: var(--size-2);
	}

	details ul {
		margin-left: var(--size-3);
		line-height: 1.5;
	}

	details li {
		margin-bottom: var(--size-1);
	}

	small {
		color: var(--text-2);
	}

	/* Import styles */
	.upload-zone {
		border: 2px dashed var(--surface-4);
		border-radius: var(--radius-2);
		padding: var(--size-6);
		text-align: center;
		margin-bottom: var(--size-4);
		transition: all 0.2s ease;
		cursor: pointer;
	}

	.upload-zone.drag-over {
		border-color: var(--brand);
		background-color: color-mix(in srgb, var(--brand) 10%, transparent);
	}

	.upload-zone:hover {
		border-color: var(--brandAlt);
	}

	.upload-content p {
		margin-bottom: var(--size-3);
		color: var(--text-2);
	}

	.select-file-button {
		background-color: var(--brand);
		border: none;
		border-radius: var(--radius-2);
		color: var(--surface-1);
		font-size: var(--font-size-3);
		font-weight: var(--font-weight-6);
		padding: var(--size-2) var(--size-4);
		cursor: pointer;
		transition: background-color 0.2s ease;
	}

	.select-file-button:hover {
		background-color: var(--brandAlt);
	}

	.validation-success {
		background-color: color-mix(in srgb, green 15%, transparent);
		border: 1px solid color-mix(in srgb, green 30%, transparent);
		border-radius: var(--radius-2);
		padding: var(--size-4);
		margin-bottom: var(--size-4);
	}

	.validation-success h4 {
		color: green;
		margin-bottom: var(--size-2);
	}

	.validation-error {
		background-color: color-mix(in srgb, red 15%, transparent);
		border: 1px solid color-mix(in srgb, red 30%, transparent);
		border-radius: var(--radius-2);
		padding: var(--size-4);
		margin-bottom: var(--size-4);
	}

	.validation-error h4 {
		color: red;
		margin-bottom: var(--size-2);
	}

	.error-list {
		margin-left: var(--size-3);
		line-height: 1.5;
	}

	.error-list li {
		margin-bottom: var(--size-1);
		font-family: var(--font-mono);
		font-size: var(--font-size-1);
	}

	.action-buttons {
		display: flex;
		gap: var(--size-3);
		margin-top: var(--size-3);
	}

	.import-button {
		background-color: green;
		border: none;
		border-radius: var(--radius-2);
		color: white;
		font-size: var(--font-size-3);
		font-weight: var(--font-weight-6);
		padding: var(--size-3) var(--size-4);
		cursor: pointer;
		transition: background-color 0.2s ease;
	}

	.import-button:hover:not(:disabled) {
		background-color: color-mix(in srgb, green 80%, black);
	}

	.import-button:disabled {
		background-color: var(--surface-4);
		cursor: not-allowed;
	}

	.cancel-button,
	.retry-button {
		background-color: var(--surface-4);
		border: none;
		border-radius: var(--radius-2);
		color: var(--text-1);
		font-size: var(--font-size-3);
		font-weight: var(--font-weight-5);
		padding: var(--size-3) var(--size-4);
		cursor: pointer;
		transition: background-color 0.2s ease;
	}

	.cancel-button:hover,
	.retry-button:hover {
		background-color: var(--surface-3);
	}

	.completion-actions {
		display: flex;
		gap: var(--size-3);
		margin-bottom: var(--size-4);
	}

	.view-history-button {
		background-color: var(--brand);
		border: none;
		border-radius: var(--radius-2);
		color: var(--surface-1);
		font-size: var(--font-size-3);
		font-weight: var(--font-weight-6);
		padding: var(--size-3) var(--size-4);
		text-decoration: none;
		display: inline-block;
		transition: background-color 0.2s ease;
	}

	.view-history-button:hover {
		background-color: var(--brandAlt);
	}

	.import-another-button {
		background-color: var(--surface-4);
		border: none;
		border-radius: var(--radius-2);
		color: var(--text-1);
		font-size: var(--font-size-3);
		font-weight: var(--font-weight-5);
		padding: var(--size-3) var(--size-4);
		cursor: pointer;
		transition: background-color 0.2s ease;
	}

	.import-another-button:hover {
		background-color: var(--surface-3);
	}
</style>
