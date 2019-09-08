import azure = require('azure-storage');
import * as utils from './utlls';
export class Blob {
  private blobService: any;

  /**
   *
   * @param connectionString - Azure Storage connection string
   */
  constructor(connectionString) {
    this.blobService = new azure.BlobService(connectionString);
  }
  /**
   * Create blob, if container/directory doesn't exist, those are created with the `options` parameter.
   * @param container  - name
   * @param directory - name, base directory is noted as empty string.
   * @param blob - name
   * @param stream
   * @param streamLength
   * @param options - defaults to public blob, container remains private (no directory listings)
   */
  public async addBlobFromStream(
    container,
    directory,
    blob,
    stream,
    streamLength,
    options: any = { publicAccessLevel: 'blob' },
  ) {
    const self = this;

    if (!container || !blob || !stream || !streamLength) {
      throw Error('Blob - params missing');
    }
    const properBlob = utils.properBlob(directory, blob);

    return new Promise((resolve, reject) => {
      self.blobService.createContainerIfNotExists(container, options, error => {
        if (error) {
          throw error;
        }

        self.blobService.createBlockBlobFromStream(container, properBlob, stream, streamLength, (error2, result) => {
          if (error2) {
            reject(error2);
          }
          resolve(result);
        });
      });
    });
  }
  /**
   * Create blob, if container/directory doens't exist, those are created with the `options` parameter.
   * @param container  - name
   * @param directory - name, base directory is noted as empty string.
   * @param blob - name
   * @param file - name with path
   * @param options - defaults to public blob, container remains private (no directory listings)
   */
  public async addBlobFromLocalFile(container, directory, blob, file, options: any = { publicAccessLevel: 'blob' }) {
    const self = this;

    if (!container || !blob || !file) {
      throw Error('Blob - params missing');
    }

    const properBlob = utils.properBlob(directory, blob);

    return new Promise((resolve, reject) => {
      self.blobService.createContainerIfNotExists(container, options, error => {
        if (error) {
          return reject(error);
        }

        self.blobService.createBlockBlobFromLocalFile(container, properBlob, file, (error2, result) => {
          if (error2) {
            return reject(error2);
          }
          return resolve(result);
        });
      });
    });
  }
  /**
   *
   * @param azureFileUri
   * @param targetContainer
   * @param targetDirectory, base directory is noted as empty string.
   * @param targetBlob
   * @param options
   */
  public async copyFileToBlobAsync(
    azureFileUri,
    targetContainer,
    targetDirectory,
    targetBlob,
    options: any = { publicAccessLevel: 'blob' },
  ) {
    const self = this;

    if (!azureFileUri || !targetContainer || !targetBlob) {
      throw Error('Blob - params missing');
    }

    const properBlob = utils.properBlob(targetDirectory, targetBlob);

    return new Promise((resolve, reject) => {
      self.blobService.createContainerIfNotExists(targetContainer, options, error => {
        if (error) {
          return reject(error);
        }

        self.blobService.startCopyBlob(azureFileUri, targetContainer, properBlob, options, (error2, result) => {
          if (error2) {
            return reject(error2);
          }

          return resolve(result);
        });
      });
    });
  }
  /**
   *
   * @param container
   * @param directory, base directory is noted as empty string.
   * @param blob
   * @param options
   */
  public async getBlobProperties(container, directory, blob, options?: any) {
    try {
      if (!container || !blob) {
        throw Error('Blob - params missing');
      }

      const self = this;
      const properBlob = utils.properBlob(directory, blob);

      return new Promise((resolve, reject) => {
        self.blobService.getBlobProperties(container, properBlob, options, (error, result) => {
          if (error) {
            return reject(error);
          }

          return resolve(result);
        });
      });
    } catch (err) {
      throw err;
    }
  }
  /**
   * Converts blob to text. The blockBlob and response return vals from getBlobToText are not returned.
   * @param container
   * @param directory, base directory is noted as empty string.
   * @param blob
   * @param options
   */
  public async getTextFromBlob(container, directory, blob, options?: any) {
    try {
      if (!container || !blob) {
        throw Error('Blob - params missing');
      }

      const self = this;
      const properBlob = utils.properBlob(directory, blob);

      return new Promise((resolve, reject) => {
        self.blobService.getBlobToText(container, properBlob, options, (error, text) => {
          if (error) {
            return reject(error);
          }

          return resolve(text);
        });
      });
    } catch (err) {
      throw err;
    }
  }
  /**
   * Returns writable blob. 
   * 
   * @param container
   * @param directory, base directory is noted as empty string.
   * @param blob
   * @param options = { blockIdPrefix: 'block' }
   */
  public getWriteStreamToBlob(container, blob, options?:any){

    return this.blobService.createWriteStreamToBlockBlob(container, blob, options)
  }
}
