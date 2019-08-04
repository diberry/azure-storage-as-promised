import azure = require('azure-storage');

export class File {
    
  private fileService: any;

  constructor(connectionString) {
    this.fileService = new azure.FileService(connectionString);
  }
  public async createShare(share, options?: any) {

    const self = this;

    if (!share) {
        throw Error('File::createShare - params missing');
    }

    return new Promise((resolve, reject) => {
      self.fileService.createShareIfNotExists(share, options, (error, response) => {
        if (error) {
            return reject(error);
        }

        return resolve(response);
      });
    });
  }
  public async deleteShare(share, options?: any) {
    const self = this;

    if (!share) {
        throw Error('File::deleteShare - params missing');
    }

    return new Promise((resolve, reject) => {
      self.fileService.deleteShareIfExists(share, options, (error, response) => {
        if (error) {
            return reject(error);
        }

        return resolve(response);
      });
    });
  }
  public async doesShareExist(share, options?: any) {
    if (!share) {
        throw Error('File::doesShareExist - params missing');
    }

    const self = this;

    return new Promise((resolve, reject) => {
      self.fileService.doesShareExist(share, options, (error, result) => {
        if (error) {
            return reject(error);
        }

        return resolve(result);
      });
    });
  }
  public async getFileProperties(share, directory, filename) {
    const self = this;

    if (!share || !directory || !filename) {
        throw Error('File::getFileProperties - params missing');
    }

    return new Promise((resolve, reject) => {
      self.fileService.getFileProperties(share, directory.toLowerCase(), filename.toLowerCase(), (error, response) => {
        if (error) {
            return reject(error);
        }

        return resolve(response);
      });
    });
  }
  public async getFileUrl(share, directory, filename): Promise<string> {
    const self = this;

    if (!share || !directory || !filename) {
        throw Error('az-files::Files::getFileUrl - params missing');
    }

    return new Promise((resolve, reject) => {
      const startDate = new Date();
      const expiryDate = new Date(startDate);
      expiryDate.setMinutes(startDate.getMinutes() + 5);
      const usePrimaryEndpoint = true;
      const shareSnapshot = undefined;

      const sharedAccessPolicy = {
        AccessPolicy: {
          Expiry: expiryDate,
          Permissions: azure.FileUtilities.SharedAccessPermissions.READ,
          Start: startDate,
        },
      };

      const sasToken = self.fileService.generateSharedAccessSignature(
        share,
        directory.toLowerCase(),
        filename,
        sharedAccessPolicy,
      );

      const url = self.fileService.getUrl(
        share,
        directory.toLowerCase(),
        filename,
        sasToken,
        usePrimaryEndpoint,
        shareSnapshot,
      );

      if (!url) {
          reject('File::getFileUrl - url is empty');
      }

      resolve(url);
    });
  }

  public async addFile(
    share,
    directory,
    filename,
    fileWithPath,
    optionalContentSettings?: any,
    optionalMetadata?: any,
  ) {
    const self = this;

    if (!share || !directory || !filename || !fileWithPath) {
        throw Error('File::addFile - params missing');
    }

    return new Promise((resolve, reject) =>{
      self.fileService.createShareIfNotExists(share, error => {
        if (error) {
            return reject(error);
        }

        self.fileService.createDirectoryIfNotExists(share, directory.toLowerCase(), error2 => {
          if (error2) {
              return reject(error2);
          }

          self.fileService.createFileFromLocalFile(
            share,
            directory.toLowerCase(),
            filename,
            fileWithPath,
            { contentSettings: optionalContentSettings, metadata: optionalMetadata },
            (error3, result) => {
              if (error3) {
                  return reject(error3);
              }
              return resolve(result);
            },
          );
        });
      });
    });
  }

  // Base directory denoted with empty string
  public async getDirectoriesAndFiles(share, directory, options?: any) {

    let continuationToken = 1;
    let items = { 
        "directories": [],
        "files": []  
    };

    let result: any;

    while (continuationToken) {
      result = await this.listDirectoriesAndFiles(share, directory, continuationToken, options);

      // files
      items.files.push.apply(items.files, result.entries.files);

      // directories
      items.directories.push.apply(items.directories, result.entries.directories);

      continuationToken = result.continuationToken;
    }
    return items;
  }
  public async listDirectoriesAndFiles(share, directory, token, options?: any) {
    if (!token) {
        throw Error('File::listDirectoriesAndFiles - params missing');
    }

    const self = this;

    return new Promise((resolve, reject) =>{
      self.fileService.listFilesAndDirectoriesSegmented(share, directory, token, options, (error, result) =>{
        if (error) {
            return reject(error);
        }

        return resolve(result);
      });
    });
  }
  public async deleteAllFilesInDirectory(share, directory, options?: any) {
    if (!share || !directory) {
        throw Error('File::deleteAllFilesInDirectory - params missing');
    }

    const resultsGetFiles:any = await this.getDirectoriesAndFiles(share, directory);

    let deleteFileResults: any[]=[];

    for (const file of resultsGetFiles.files) {

        const deleteFileResult = await this.deleteFile(share, directory, file.name, options);
  
        const fileDeleted:any = {
          name: file.name,
          properties: file,
          status: deleteFileResult
        };
  
        deleteFileResults.push(fileDeleted);
    }

    return deleteFileResults;
  }
  // deleted later during garbage collection
  public async deleteFile(share, directory, file, options?: any) {
    if (!directory || !file) {
        throw Error('File::deleteFile - params missing');
    }

    const self = this;

    return new Promise((resolve, reject) =>{
      self.fileService.deleteFileIfExists(share, directory, file, options, (error, result) => {
        if (error) {
            return reject(error);
        }

        // result: boolean
        return resolve(result);
      });
    });
  }
  // The directory must be empty before it can be deleted.
  public async deleteDirectory(share, directory, options?: any) {
    if (!share || !directory) {
        throw Error('File::deleteDirectory - params missing');
    }

    const self = this;

    await self.deleteAllFilesInDirectory(share, directory);

    return new Promise((resolve, reject) =>{
      self.fileService.deleteDirectoryIfExists(share, directory, options, (error, result) => {
        if (error) {
            return reject(error);
        }

        // result: boolean
        return resolve(result);
      });
    });
  }
  public async createDirectory(share, directory, options?: any) {
    if (!share || !directory) {
        throw Error('File::createDirectory - params missing');
    }

    await this.createShare(share);

    const self = this;

    return new Promise((resolve, reject) => {
      self.fileService.createDirectoryIfNotExists(share, directory, options, (error, result) => {
        if (error) {
            return reject(error);
        }

        // result: boolean
        return resolve(result);
      });
    });
  }

  public async doesDirectoryExist(share, directory, options?: any) {
      
    if (!share || !directory) {
        throw Error('File::doesDirectoryExist - params missing');
    }

    const self = this;

    return new Promise((resolve, reject) => {
      self.fileService.doesDirectoryExist(share, directory, options, (error, result) => {
        if (error) {
            return reject(error);
        }

        // result: boolean
        return resolve(result.exists);
      });
    });
  }
  public getAccessToken(share, directory, file, sharedAccessPolicy={ AccessPolicy: { 
        Expiry: (new Date().getMinutes() + 5),
        Permissions: azure.FileUtilities.SharedAccessPermissions.READ,
        Start: new Date()}}){

        if ( !share || !directory || !file || !sharedAccessPolicy) throw Error("Files - params missing");

        return this.fileService.generateSharedAccessSignature(share, directory, file, sharedAccessPolicy);

    }
}
