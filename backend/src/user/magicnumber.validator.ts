import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  FileValidator,
  FileTypeValidatorOptions,
  HttpStatus,
  HttpException,
} from "@nestjs/common";
var fs = require("fs");

@Injectable()
export class MagicNumberValidator extends FileValidator<any> {
  isValid(file?: any): boolean | Promise<boolean> {
    const readStream = fs.readFileSync(process.cwd() + "/" + file.path);
    return this.checkMagicNumber("image/png", readStream);
  }
  buildErrorMessage(file: any): string {
    throw new HttpException(
      "This file isn't a PNG file sorry.",
      HttpStatus.BAD_REQUEST
    );
  }

  checkMagicNumber(type: string, buffer: Buffer) {
    if (type == "image/jpg" || type == "image/jpeg") {
      if (buffer.toString("hex").length < "ffd8ff".length) {
        return false;
      }
      if (buffer.toString("hex").substring(0, 6) == "ffd8ff") return true;
    } else if (type == "image/png") {
      if (buffer.toString("hex").length < "89504e47".length) {
        return false;
      }
      if (buffer.toString("hex").substring(0, 8) == "89504e47") return true;
    }
    return false;
  }
}
