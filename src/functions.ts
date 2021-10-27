import iamges from 'images';

/** 压缩图片尺寸大小和质量 */
export function compressImage(srcPath: string, distPath: string, size = 1024, quality = 50 ): void {
  iamges(srcPath).size(size).save(distPath, { quality });
}
