import {Component, OnInit, Renderer2} from '@angular/core';
import * as JSONEditor from '@json-editor/json-editor';
import {ConfirmResetComponent} from './confirm-reset/confirm-reset.component';
import {MatDialog} from '@angular/material/dialog';
import PouchDB from 'pouchdb';

interface Food {
  value: string;
  viewValue: string;
}
@Component({
  selector: 'app-json',
  templateUrl: './app.component.html'
})

export class AppComponent implements OnInit {
  dialog: MatDialog;
  renderer: Renderer2;
  options: any;
  jsonEditorCode: any;
  jsonEditorTree: any;
  darkMode: boolean;
  autoConvert: boolean;
  jsonCode: any;
  db: any;
  test: any;
  selectedValue: any;
  clients = [
    { id : '1', clientName: ''},
    { id : '2', clientName: ''},
    { id : '3', clientName: ''}
  ];

  constructor(dialog: MatDialog, renderer: Renderer2) {
    this.dialog = dialog;
    this.renderer = renderer;
  }

  ngOnInit() {
    this.options = {
      code: {
        mode: 'code',
        onChange: () => {
          const json = this.jsonEditorCode.get();
          if (json) {
            this.jsonCode = json;
            this.setLocalStorage('jsonCode', JSON.stringify(json));
            if (this.autoConvert) {
              this.validateJSON('Tree');
            }
          }
        }
      },
      tree: {
        mode: 'tree',
        onChange: () => {
          const json = this.jsonEditorTree.get();
          if (json) {
            this.jsonCode = json;
            this.setLocalStorage('jsonCode', JSON.stringify(json));
            this.validateJSON('Code');
          }
        }
      }
    };
    this.jsonEditorCode = new JSONEditor(document.getElementById('jsonEditorCode'), this.options.code);
    this.jsonEditorTree = new JSONEditor(document.getElementById('jsonEditorTree'), this.options.tree);
    this.setDefaultOptions();
  }

  validateJSON = (type) => {
    if (type === 'Tree') {
      this.jsonEditorTree.set(this.jsonCode);
    } else if (type === 'Code') {
      this.jsonEditorCode.set(this.jsonCode);
    }
  }

  toggleTheme = (darkMode: boolean) => {
    this.setLocalStorage('darkModeJSON', darkMode);
    darkMode ? this.renderer.addClass(document.body, 'dark-theme') : this.renderer.removeClass(document.body, 'dark-theme');
  }

  setLocalStorage = (key, value) => {
    localStorage.setItem(key, value);
  }

  clearStorageOptions = () => {
    const className = this.darkMode ? 'confirmation-dark' : 'confirmation';
    const dialogRef = this.dialog.open(ConfirmResetComponent, {
      panelClass: className,
      restoreFocus: false
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        localStorage.removeItem('darkModeJSON');
        localStorage.removeItem('jsonCode');
        localStorage.removeItem('autoConvertJSON');
        this.setDefaultOptions();
      }
    });
  }

  setDefaultOptions = async () => {
    this.darkMode = JSON.parse(localStorage.getItem('darkModeJSON'));
    this.autoConvert = JSON.parse(localStorage.getItem('autoConvertJSON'));

    let cr = [];
    let potatoJson = [];
    let db = new PouchDB('http://localhost:5984/calen');
    try {
      await db.allDocs({
        include_docs: true,
        attachments: true
      }).then(function (result) {
        for (let i = 0; i < result.rows.length; i++) {
          cr.push(result.rows[i].doc._id);
          if(result.rows[i].doc._id == "potato"){
           potatoJson = result.rows[i].doc.note.instructions;
          }
        }
      });
    } catch (e) {
      console.log(e);
    }
    for (let i = 0; i < cr.length-2; i++){
      this.clients[i].clientName = cr[i+2];
    }
    //this.selectedValue = this.clients[0].clientName;

    console.log(potatoJson);
    this.jsonCode = localStorage.getItem('jsonCode') ?
      JSON.parse(localStorage.getItem('jsonCode')) : potatoJson;
    //   {
    //   Array: [1, 2, 3],
    //   Boolean: true,
    //   Null: null,
    //   Number: 123,
    //   Object: {
    //     a: 'b',
    //     c: 'd'
    //   },
    //   String: 'Hello World'
    // };
    this.validateJSON('Code');
    this.validateJSON('Tree');
    if (this.autoConvert) {
      this.validateJSON('Tree');
    }
    if (this.darkMode) {
      this.renderer.addClass(document.body, 'dark-theme');
    }
  }

  async changeClient(value) {
    this.selectedValue = value;
    console.log(this.selectedValue);

    let cropJsonOp = [];
    switch (this.selectedValue){
      case "1": cropJsonOp = await this.getCropJson("grape");
      break;
      case "2": cropJsonOp = await this.getCropJson("onion");
      break;
      case "3": cropJsonOp = await this.getCropJson("potato");
      break;
      default : cropJsonOp = await this.getCropJson("potato");
      break;
    }
    console.log(cropJsonOp);
    this.jsonCode = cropJsonOp;
    this.validateJSON('Code');
    this.validateJSON('Tree');
    if (this.autoConvert) {
      this.validateJSON('Tree');
    }
    if (this.darkMode) {
      this.renderer.addClass(document.body, 'dark-theme');
    }
  }

  async getCropJson(cropInp) {
    let cropJson = [];
    let db = new PouchDB('http://localhost:5984/calen');
    try {
      await db.allDocs({
        include_docs: true,
        attachments: true
      }).then(function(result) {
        for (let i = 0; i < result.rows.length; i++) {
          if (result.rows[i].doc._id == cropInp) {
            cropJson = result.rows[i].doc.note.instructions;
          }
        }
      });
    } catch (e) {
      console.log(e);
    }
    return cropJson;
  }
}
