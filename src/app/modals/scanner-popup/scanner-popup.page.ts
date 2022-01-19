import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
//import { RoomSearch } from '../../models/room-search.model';

@Component({
  selector: 'app-scanner-popup',
  templateUrl: './scanner-popup.page.html',
  styleUrls: ['./scanner-popup.page.scss'],
})
export class ScannerPopupPage implements OnInit {
  @Input() search_institution: string;
  @Input() results_scanned: number;
  @Input() results_matched: number;
  @Input() search_id: string;

  constructor(public modalCtrl: ModalController, public router: Router) { }

  ngOnInit() {
  }

  dismiss() {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.modalCtrl.dismiss({
      'dismissed': true
    });
  }

  continue(){
  	this.dismiss();
  	this.router.navigate(['/results' + '/' + this.search_id]);
  }

}