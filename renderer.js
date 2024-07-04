const { ipcRenderer, dialog } = require('electron').remote;
const path = require('path'); // Adicionando a importação do módulo path

let interval;
let fileIndex = 0;
let files = [];

document.getElementById('browseButton').addEventListener('click', () => {
  dialog.showOpenDialog({ properties: ['openDirectory'] }).then(result => {
    if (!result.canceled) {
      document.getElementById('folderPath').value = result.filePaths[0];
      console.log('Selected folder:', result.filePaths[0]);
    }
  });
});

document.getElementById('startButton').addEventListener('click', () => {
  const folderPath = document.getElementById('folderPath').value;
  if (folderPath) {
    console.log('Sending get-files event with path:', folderPath);
    ipcRenderer.send('get-files', folderPath);
  }
});

document.getElementById('stopButton').addEventListener('click', () => {
  clearInterval(interval);
  console.log('Interval stopped');
});

ipcRenderer.on('get-files-response', (event, response) => {
  console.log('Received get-files-response:', response);
  if (response.success) {
    files = response.files.map(file => path.join(document.getElementById('folderPath').value, file));
    fileIndex = 0;
    document.getElementById('fileList').innerHTML = files.map(file => `<li>${file}</li>`).join('');
    document.getElementById('status').innerText = `Files opened: 0`;

    interval = setInterval(() => {
      if (fileIndex < files.length) {
        console.log('Opening file:', files[fileIndex]);
        ipcRenderer.send('open-file', files[fileIndex]);
        fileIndex++;
        document.getElementById('status').innerText = `Files opened: ${fileIndex}`;
      } else {
        clearInterval(interval);
        alert('All files have been clicked.');
      }
    }, 5000);
  } else {
    alert(`Error: ${response.message}`);
  }
});
