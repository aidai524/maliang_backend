import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { existsSync, mkdirSync } from 'fs';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

// 上传目录配置
const uploadDir = join(process.cwd(), 'uploads');

// 确保上传目录存在
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true });
}

// 存储配置
const storage = diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = uuidv4();
    const ext = extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

// 文件过滤器
const imageFileFilter = (req: any, file: any, cb: any) => {
  if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
    return cb(new BadRequestException('Only image files are allowed!'), false);
  }
  cb(null, true);
};

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  @Post('image')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload an image' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage,
      fileFilter: imageFileFilter,
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // 构建访问 URL
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
    const url = `${baseUrl}/uploads/${file.filename}`;

    return {
      url,
      filename: file.filename,
      originalname: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    };
  }
}
