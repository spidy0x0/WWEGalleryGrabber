const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function getData(url) {
    const response = await axios.get(url);
    return response.data;
}

async function downloadImage(url, filename) {
  const response = await axios.get(url, {
    responseType: 'stream'
  });
  response.data.pipe(fs.createWriteStream(filename));
  console.log(`downloaded ${filename}`);
}

let next = 40106098;

  async function getImgs(){
        const initialUrl = `https://www.wwe.com/api/gallery/${next}/0/0/0`;
        const initialData = await getData(initialUrl);
        const totalImages = initialData.total_images;

        const updatedUrl = initialUrl.replace('/0/', `/${totalImages}/`);
        const updatedData = await getData(updatedUrl);
        // console.log(updatedData);
        let {
            photos
        } = updatedData;

        next = updatedData.next_gallery;

        const regex = /src="(.*?)"/;

        const srcValues = photos.map(({
            photo
        }) => {
            const match = photo.match(regex);
            return 'https://www.wwe.com'+match[1];
        });

        console.log(srcValues);


        //download images
        const folderName = updatedData.title;
        if (!fs.existsSync(folderName)) {
          fs.mkdirSync(folderName);
        }
      
        let promises = [];
        srcValues.forEach((photo, index) => {
          const filename = path.join(folderName, `photo-${index}.jpg`);
          setTimeout(() => {
            promises.push(downloadImage(photo, filename));
          }, 1000);
        });

        await Promise.all(promises)
        .then(() => {
            console.log("All images have been downloaded.");
            if (next) {
              setTimeout(() => {
                getImgs();
              }, 3000);
            } else {
                console.log("No more galleries to download.")
            }
        });
  };

  getImgs();
