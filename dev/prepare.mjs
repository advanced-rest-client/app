/* eslint-disable class-methods-use-this */
/* eslint-disable import/no-extraneous-dependencies */
import path from "path";
import browserify from "browserify";
import fs from "fs-extra";
import babel from '@babel/core';
import UglifyJS from 'uglify-js';

/**
 * A class that is executed when node dependencies are installed.
 */
class JexlPrepare {
  async run() {
    const file = path.join('dev', 'jexl-import.js');
    const dest = path.join('dev', 'jexl.window.js');
    const code = await this.nodeToBrowser(file);
    const resolved = await this.babelify(code);
    const result = this.uglyContent(resolved);
    await fs.writeFile(dest, result, 'utf8');
  }

  /**
   * @param {string} file 
   * @returns {Promise<string>} 
   */
  nodeToBrowser(file) {
    return new Promise((resolve, reject) => {
      const b = browserify();
      b.add(file);
      b.bundle((err, buf) => {
        if (err) {
          // console.log(err);
          reject(err);
        } else {
          resolve(buf.toString());
        }
      });
    });
  }

  /**
   * @param {string} code 
   * @returns {Promise<string>}
   */
   babelify(code) {
    return new Promise((resolve, reject) => {
      const cnf = {
        'presets': [[
          '@babel/preset-env'
        ]],
        'plugins': ['minify-mangle-names']
      };
      babel.transform(code, cnf, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result.code);
        }
      });
    });
  }

  /**
   * @param {string} content
   * @returns string
   */
  uglyContent(content) {
    const result = UglifyJS.minify(content, {
      // @ts-ignore
      compress: true
    });
    if (result.error) {
      throw result.error;
    }
    return result.code;
  }
}
new JexlPrepare().run();
