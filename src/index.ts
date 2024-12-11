import { FileSystemHost, Project } from "ts-morph";
import { VueFileSystemHost } from "./vueFileSystemHost";

/** Create VueFileSystemHost with default underlying FileSystemHost. */
export function createVueFileSystemHost(): FileSystemHost {
  const fileSystemHost = new Project().getFileSystem();
  return new VueFileSystemHost(fileSystemHost);
}

export { VueFileSystemHost }
