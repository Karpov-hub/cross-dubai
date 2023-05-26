import Base from "@lib/base";
import Operations from "./lib/operations";

export default class Service extends Base {
  publicMethods() {
    return {
      push: {
        method: Operations.push,
        description: "Push file"
      },
      pull: {
        method: Operations.pull,
        description: "Pull file"
      },
      status: {
        method: Operations.status,
        description: "Status file"
      },
      remove: {
        method: Operations.remove,
        description: "Remove file"
      },
      accept: {
        method: Operations.accept,
        description: "Accept file"
      },
      getContent: {
        method: Operations.getContent,
        description: "Get file content"
      },
      getStaticFiles: {
        method: Operations.getStaticFiles,
        description: "Get static files"
      }
    };
  }
}
