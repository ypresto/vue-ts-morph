import { parse as parseSfc } from "@vue/compiler-sfc";
import { FileSystemHost, RuntimeDirEntry } from "ts-morph";

function fromVirtualPath(filePath: string): string {
  if (filePath.endsWith(".vue.ts")) {
    return filePath.substring(0, filePath.lastIndexOf("."));
  }
  return filePath;
}

function toVirtualPath(filePath: string): string {
  if (filePath.endsWith(".vue")) {
    return filePath + ".ts";
  }
  return filePath;
}

export class VueFileSystemHost implements FileSystemHost {
  constructor(private fileSystemHost: FileSystemHost) {}
  isCaseSensitive(): boolean {
    return this.fileSystemHost.isCaseSensitive();
  }
  delete(path: string): Promise<void> {
    return this.fileSystemHost.delete(fromVirtualPath(path));
  }
  deleteSync(path: string): void {
    return this.fileSystemHost.deleteSync(fromVirtualPath(path));
  }
  readDirSync(dirPath: string): RuntimeDirEntry[] {
    return this.fileSystemHost.readDirSync(dirPath).map(
      (entry): RuntimeDirEntry => ({
        ...entry,
        name: toVirtualPath(entry.name),
      })
    );
  }
  async readFile(filePath: string, encoding?: string): Promise<string> {
    if (!filePath.endsWith(".vue.ts")) {
      return await this.fileSystemHost.readFile(filePath, encoding);
    }

    filePath = fromVirtualPath(filePath);
    const content = await this.fileSystemHost.readFile(filePath, encoding);
    const { descriptor } = parseSfc(content);
    return (
      (descriptor.scriptSetup ?? descriptor.script)?.content.replace(
        /^\n/,
        ""
      ) ?? ""
    );
  }
  readFileSync(filePath: string, encoding?: string): string {
    if (!filePath.endsWith(".vue.ts")) {
      return this.fileSystemHost.readFileSync(filePath, encoding);
    }

    filePath = fromVirtualPath(filePath);
    const content = this.fileSystemHost.readFileSync(filePath, encoding);
    const { descriptor } = parseSfc(content);
    return (
      (descriptor.scriptSetup ?? descriptor.script)?.content.replace(
        /^\n/,
        ""
      ) ?? ""
    );
  }
  async writeFile(filePath: string, fileText: string): Promise<void> {
    if (!filePath.endsWith(".vue.ts")) {
      await this.fileSystemHost.writeFile(filePath, fileText);
      return;
    }

    filePath = fromVirtualPath(filePath);

    const existingText = await this.fileSystemHost.readFile(filePath, "utf-8");
    const { descriptor } = parseSfc(existingText);
    const scriptBlock = descriptor.scriptSetup ?? descriptor.script;
    if (!scriptBlock) {
      throw new Error(
        "Cannot write to Vue file: No script block found in .vue file"
      );
    }

    const modifiedText =
      existingText.substring(0, scriptBlock.loc.start.offset) +
      "\n" +
      fileText +
      existingText.substring(scriptBlock.loc.end.offset);

    await this.fileSystemHost.writeFile(filePath, modifiedText);
  }
  writeFileSync(filePath: string, fileText: string): void {
    if (!filePath.endsWith(".vue.ts")) {
      this.fileSystemHost.writeFileSync(filePath, fileText);
      return;
    }

    filePath = fromVirtualPath(filePath);

    const existingText = this.fileSystemHost.readFileSync(filePath, "utf-8");
    const { descriptor } = parseSfc(existingText);
    const scriptBlock = descriptor.scriptSetup ?? descriptor.script;
    if (!scriptBlock) {
      throw new Error(
        "Cannot write to Vue file: No script block found in .vue file"
      );
    }

    const modifiedText =
      existingText.substring(0, scriptBlock.loc.start.offset) +
      "\n" +
      fileText +
      existingText.substring(scriptBlock.loc.end.offset);

    this.fileSystemHost.writeFileSync(filePath, modifiedText);
  }
  mkdir(dirPath: string): Promise<void> {
    return this.fileSystemHost.mkdir(dirPath);
  }
  mkdirSync(dirPath: string): void {
    return this.fileSystemHost.mkdirSync(dirPath);
  }
  move(srcPath: string, destPath: string): Promise<void> {
    return this.fileSystemHost.move(
      fromVirtualPath(srcPath),
      fromVirtualPath(destPath)
    );
  }
  moveSync(srcPath: string, destPath: string): void {
    return this.fileSystemHost.moveSync(
      fromVirtualPath(srcPath),
      fromVirtualPath(destPath)
    );
  }
  copy(srcPath: string, destPath: string): Promise<void> {
    return this.fileSystemHost.copy(
      fromVirtualPath(srcPath),
      fromVirtualPath(destPath)
    );
  }
  copySync(srcPath: string, destPath: string): void {
    return this.fileSystemHost.copySync(
      fromVirtualPath(srcPath),
      fromVirtualPath(destPath)
    );
  }
  fileExists(filePath: string): Promise<boolean> {
    return this.fileSystemHost.fileExists(fromVirtualPath(filePath));
  }
  fileExistsSync(filePath: string): boolean {
    return this.fileSystemHost.fileExistsSync(fromVirtualPath(filePath));
  }
  directoryExists(dirPath: string): Promise<boolean> {
    return this.fileSystemHost.directoryExists(fromVirtualPath(dirPath));
  }
  directoryExistsSync(dirPath: string): boolean {
    return this.fileSystemHost.directoryExistsSync(fromVirtualPath(dirPath));
  }
  realpathSync(path: string): string {
    return this.fileSystemHost.realpathSync(fromVirtualPath(path));
  }
  getCurrentDirectory(): string {
    return this.fileSystemHost.getCurrentDirectory();
  }
  glob(patterns: ReadonlyArray<string>): Promise<string[]> {
    // TODO: maybe wrong
    return this.fileSystemHost.glob(
      patterns.map((pattern) => toVirtualPath(pattern))
    );
  }
  globSync(patterns: ReadonlyArray<string>): string[] {
    // TODO: maybe wrong
    return this.fileSystemHost.globSync(
      patterns.map((pattern) => toVirtualPath(pattern))
    );
  }
}
