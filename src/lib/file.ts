import azure = require('azure-storage');

export class File {
  private fileService: any;

  /**
   *
   * @param connectionString - Azure Storage connection string
   */
  constructor(connectionString) {
    this.fileService = new azure.FileService(connectionString);
  }
  /**
   *
   * @param share
   * @param options
   */
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
  /**
   *
   * @param share
   * @param options
   */
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
  /**
   *
   * @param share
   * @param options
   */
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
  /**
   *
   * @param share
   * @param directory
   * @param filename
   */
  public async getFileProperties(share, directory, filename) {
    const self = this;

    if (!share || !directory || !filename) {
      throw Error('File::getFileProperties - params missing');
    }

    return new Promise((resolve, reject) => {
      self.fileService.getFileProperties(share, directory, filename, (error, response) => {
        if (error) {
          return reject(error);
        }

        return resolve(response);
      });
    });
  }
  /**
   *
   * @param share
   * @param directory
   * @param filename
   */
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

      const sasToken = self.fileService.generateSharedAccessSignature(share, directory, filename, sharedAccessPolicy);

      const url = self.fileService.getUrl(share, directory, filename, sasToken, usePrimaryEndpoint, shareSnapshot);

      if (!url) {
        reject('File::getFileUrl - url is empty');
      }

      resolve(url);
    });
  }
  /**
   *
   * @param share
   * @param directory
   * @param filename
   * @param fileWithPath
   * @param optionalContentSettings
   * @param optionalMetadata
   */
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

    return new Promise((resolve, reject) => {
      self.fileService.createShareIfNotExists(share, error => {
        if (error) {
          return reject(error);
        }

        self.fileService.createDirectoryIfNotExists(share, directory, error2 => {
          if (error2) {
            return reject(error2);
          }

          self.fileService.createFileFromLocalFile(
            share,
            directory,
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

  /**
   *
   * @param share
   * @param directory
   * @param options
   */
  public async getDirectoriesAndFiles(share, directory, options?: any) {
    let continuationToken = 1;
    let items = {
      directories: [],
      files: [],
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
  /**
   *
   * @param share
   * @param directory
   * @param token
   * @param options
   */
  public async listDirectoriesAndFiles(share, directory, token, options?: any) {
    if (!token) {
      throw Error('File::listDirectoriesAndFiles - params missing');
    }

    const self = this;

    return new Promise((resolve, reject) => {
      self.fileService.listFilesAndDirectoriesSegmented(share, directory, token, options, (error, result) => {
        if (error) {
          return reject(error);
        }

        return resolve(result);
      });
    });
  }
  /**
   *
   * @param share
   * @param directory
   * @param options
   */
  public async deleteAllFilesInDirectory(share, directory, options?: any) {
    if (!share || !directory) {
      throw Error('File::deleteAllFilesInDirectory - params missing');
    }

    const resultsGetFiles: any = await this.getDirectoriesAndFiles(share, directory);

    let deleteFileResults: any[] = [];

    for (const file of resultsGetFiles.files) {
      const deleteFileResult = await this.deleteFile(share, directory, file.name, options);

      const fileDeleted: any = {
        name: file.name,
        properties: file,
        status: deleteFileResult,
      };

      deleteFileResults.push(fileDeleted);
    }

    return deleteFileResults;
  }
  /**
   *
   * @param share
   * @param directory
   * @param file
   * @param options
   */
  public async deleteFile(share, directory, file, options?: any) {
    if (!directory || !file) {
      throw Error('File::deleteFile - params missing');
    }

    const self = this;

    return new Promise((resolve, reject) => {
      self.fileService.deleteFileIfExists(share, directory, file, options, (error, result) => {
        if (error) {
          return reject(error);
        }

        // result: boolean
        return resolve(result);
      });
    });
  }
  /**
   * The directory must be empty before it can be deleted.
   * @param share
   * @param directory
   * @param options
   */
  public async deleteDirectory(share, directory, options?: any) {
    if (!share || !directory) {
      throw Error('File::deleteDirectory - params missing');
    }

    const self = this;

    await self.deleteAllFilesInDirectory(share, directory);

    return new Promise((resolve, reject) => {
      self.fileService.deleteDirectoryIfExists(share, directory, options, (error, result) => {
        if (error) {
          return reject(error);
        }

        // result: boolean
        return resolve(result);
      });
    });
  }
  /**
   *
   * @param share
   * @param directory
   * @param options
   */
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
  /**
   *
   * @param share
   * @param directory
   * @param options
   */
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
  /**
   *
   * @param share
   * @param directory
   * @param file
   * @param sharedAccessPolicy
   */
  public getAccessToken(
    share,
    directory,
    file,
    sharedAccessPolicy = {
      AccessPolicy: {
        Expiry: new Date().getMinutes() + 5,
        Permissions: azure.FileUtilities.SharedAccessPermissions.READ,
        Start: new Date(),
      },
    },
  ) {
    if (!share || !directory || !file || !sharedAccessPolicy) {
      throw Error('Files - params missing');
    }

    return this.fileService.generateSharedAccessSignature(share, directory, file, sharedAccessPolicy);
  }
}
