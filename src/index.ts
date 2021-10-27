import fs from 'fs/promises';
import axios from 'axios';

import { compressImage } from './functions';

const originPath = './downloadedImages';
const compressPath = './compressImages';

!async function() {
  try {
    await fs.mkdir(originPath);
    await fs.mkdir(compressPath);
  } catch (e: any) {
    // console.error(e);
  }
  try {
    const imageUrlList = await getImageUrlList('./src/test1.txt');
    downloadImage(imageUrlList.slice(0, 500), 400 *1024);
  } catch (e) {
    console.debug(e);
  }
}();


/** 下载网络图片，大于 limit 才下载，limit 的单位是 bytes*/
async function downloadImage(urls: string[], limit = 0) {
  const taskList = urls.map(async (url, index, array) => {
    try {
      // 获取文件头部信息，用于判断文件大小
      const headRes = await axios.head(url);
      if (Number(headRes.headers['content-length']) >= limit) {
        const fileName = url.split('/').reverse()[0];
        const folderName = url.split('/').reverse()[1];
        const fileSavePath = `./${originPath}/${folderName}/${fileName}`;
        const folderPath = `./${originPath}/${folderName}`;
        const compressFileSavePath = `./${compressPath}/${folderName}/${fileName}`;
        const compressFolderPath = `./${compressPath}/${folderName}`;
        try {
          await fs.access(fileSavePath);
          console.debug(`第${ index + 1 }文件存在，跳过。`);
        } catch (e) {
          console.debug(`第${ index + 1 }文件不存在，需要下载！`);
          const res = await axios({ url, responseType: 'arraybuffer' });
          fs.access(folderPath)
            .then(res => console.debug(`${folderPath} 文件夹目录存在，不需要创建。`))
            .catch(e => {
              console.debug(`${folderPath} 文件夹目录不存在，需要创建！`);
              fs.mkdir(folderPath);
            });

          fs.access(compressFolderPath)
          .then(res => console.debug(`${compressFolderPath} 文件夹目录存在，不需要创建。`))
          .catch(e => {
            console.debug(`${compressFolderPath} 文件夹目录不存在，需要创建！`);
            fs.mkdir(compressFolderPath);
          });

          try {
            await fs.writeFile(fileSavePath, res.data as any, 'binary');
            console.debug(`${fileSavePath}，下载成功。`);
            compressImage(fileSavePath, compressFileSavePath);
          } catch(e) {
            console.debug(e);
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  });
  await Promise.all([taskList[0]]);
}

async function getImageUrlList(path: string) {
  const res = await fs.readFile(path);
  const imageUrlList = res.toString().split(/\r?\n/);
  return imageUrlList;
}

