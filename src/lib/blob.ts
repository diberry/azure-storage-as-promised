import azure = require('azure-storage');

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
     * Create blob, if container/directory doens't exist, those are created with the `options` parameter.
     * @param container  - name
     * @param directory - name
     * @param blob - name
     * @param stream 
     * @param streamLength 
     * @param options - defaults to public blob, container remains private (no directory listings)
     */
    public async addBlobFromStream(container, directory, blob, stream, streamLength, options: any = { publicAccessLevel: 'blob' }) {

        const self = this;

        if (!container || !directory || !blob || !stream || !streamLength) {
            throw ("Blob - params missing");
        }

        return new Promise((resolve, reject) => {

            self.blobService.createContainerIfNotExists(container, options, (error) => {

                if (error) {
                    throw error;
                }

                self.blobService.createBlockBlobFromStream(container, `${directory}/${blob}`, stream, streamLength, (error2, result) => {
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
     * @param directory - name
     * @param blob - name
     * @param file - name with path
     * @param options - defaults to public blob, container remains private (no directory listings)
     */
    public async addBlobFromLocalFile(container, directory, blob, file, options: any = { publicAccessLevel: 'blob' }) {

        const self = this;

        if (!container || !directory || !blob || !file) {
            throw ("Blob - params missing");
        }

        return new Promise(function (resolve, reject) {

            self.blobService.createContainerIfNotExists(container, options, (error) => {

                if (error) {
                    return reject(error);
                }

                self.blobService.createBlockBlobFromLocalFile(
                    container,
                    `${directory}/${blob}`,
                    file,
                    (error2, result) => {
                        if (error2) {
                            return reject(error2);
                        }
                        return resolve(result);
                    }
                );
            });
        });
    }
    public async copyFileToBlobAsync(azureFileUri, targetContainer, targetDirectory, targetBlob, options: any = { publicAccessLevel: 'blob' }) {

        const self = this;

        if (!azureFileUri || !targetContainer || !targetDirectory || !targetBlob) {
            throw Error("Blob - params missing");
        }

        return new Promise(function (resolve, reject) {

            self.blobService.createContainerIfNotExists(targetContainer, options, (error) => {

                if (error) {
                    return reject(error);
                }

                self.blobService.startCopyBlob(azureFileUri, targetContainer, `${targetDirectory}/${targetBlob}`, options, (error2, result) => {
                    if (error2) {
                        return reject(error2);
                    }

                    return resolve(result);
                });
            });
        });
    }
    public async getBlobProperties(container, directory, blob, options?: any) {

        if (!container || !directory || !blob) throw Error("Blob - params missing");

        let self = this;

        return new Promise(function (resolve, reject) {

            self.blobService.getBlobProperties(container, `${directory}/${blob}`, options, (error, result) => {

                if (error) {
                    return reject(error);
                }

                return resolve(result);

            });
        });
    }
    /**
     * Converts blob to text. The blockBlob and response return vals from getBlobToText are not returned. 
     * @param container 
     * @param directory 
     * @param blob 
     * @param options 
     */
    public async getTextFromBlob(container, directory, blob, options?: any) {
        try {

            let self = this;
            return new Promise(function (resolve, reject) {

                self.blobService.getBlobToText(container, `${directory}/${blob}`, options, (error, text) => {
    
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

}
