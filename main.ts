import { Plugin, TFile } from "obsidian";

export default class HeadingDisplayPlugin extends Plugin {
  async onload() {
    console.log("Heading Display Plugin loaded!");

    // Update the File Explorer when a file is modified
    this.registerEvent(
      this.app.vault.on("modify", this.updateFileExplorerDisplay.bind(this))
    );

    // Perform initial updates when the workspace layout is ready
    this.app.workspace.onLayoutReady(() => {
      this.updateFileExplorerDisplay();
    });
  }

  onunload() {
    console.log("Heading Display Plugin unloaded!");
  }

  /**
   * Updates the File Explorer to show the first heading, or falls back to the filename.
   */
  async updateFileExplorerDisplay() {
    const files = this.app.vault.getFiles();

    for (const file of files) {
      if (!(file instanceof TFile)) continue;

      // Get the first heading from the file content
      const metadata = this.app.metadataCache.getFileCache(file);
      const headings = metadata?.headings;
      const firstHeading = headings?.[0]?.heading ?? null;

      // Find the corresponding element in the File Explorer
      const fileExplorerElement = document.querySelector(
        `[data-path="${file.path}"] .nav-file-title-content`
      );

      // Update the display text with the first heading or the filename
      if (fileExplorerElement) {
        fileExplorerElement.textContent = firstHeading || file.basename;
      }
    }
  }

  /**
   * Removes the YAML header from the file content.
   *
   * @param {string} content - The content of the file.
   * @returns {string} - The content without the YAML header.
   */
  removeYamlHeader(content: string): string {
    if (content.startsWith("---")) {
      const yamlEnd = content.indexOf("\n---", 3);
      if (yamlEnd !== -1) {
        return content.slice(yamlEnd + 4).trim(); // Remove YAML block
      }
    }
    return content;
  }

  /**
   * Extracts the first heading from the file content.
   *
   * @param {string} content - The content of the file.
   * @returns {string | null} - The first heading found, or null if none exists.
   */
  getFirstHeading(content: string): string | null {
    // Match the first heading of any level (#, ##, ###, etc.)
    const match = content.match(/^\s*#+\s+(.*)/m);
    return match ? match[1].trim() : null; // Return the heading text, or null if not found
  }
}
