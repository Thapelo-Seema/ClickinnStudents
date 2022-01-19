import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ModalController, AlertController, ToastController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { ScannerPopupPage } from '../../modals/scanner-popup/scanner-popup.page';
import { MapsService } from '../../services/maps.service';
import { SearchFeedService } from '../../services/search-feed.service';
import { take } from 'rxjs/operators';
import { RoomSearch } from '../../models/room-search.model';
import { RoomSearchService } from '../../object-init/room-search.service';
import { MarkerOptions } from '../../models/marker-options.model';
import { RoomService } from '../../services/room.service';
import { IonicComponentService } from '../../services/ionic-component.service';

declare var google: any;

@Component({
  selector: 'app-agent-scanning',
  templateUrl: './agent-scanning.page.html',
  styleUrls: ['./agent-scanning.page.scss'],
})
export class AgentScanningPage implements OnInit {

  @ViewChild('map', {read: ElementRef, static: false}) mapRef: ElementRef;
  map: any;
  search: RoomSearch;
  scanning_done: boolean = false;
  constructor(
    public modalCtrl: ModalController,
    private alert_controller: AlertController, 
    private ionic_component_svc: IonicComponentService,
    public maps_svc: MapsService,
    private actRoute: ActivatedRoute, 
    private router: Router, 
    private sf_svc: SearchFeedService,
    private room_search_init_svc: RoomSearchService,
    private room_svc: RoomService ) {
    this.search = this.room_search_init_svc.defaultRoomSearch();
  }

  ngOnInit() {
    if(this.actRoute.snapshot.paramMap.get("search_id")){
      this.sf_svc.getSearch(this.actRoute.snapshot.paramMap.get("search_id"))
      .pipe(take(1))
      .subscribe(sch =>{
        this.search = sch;
        this.showMap();
        this.ionic_component_svc.presentToast("Scanning for agents", 5000);
        //launch search
        this.sf_svc.getRoomSearchResults(this.search)
        .pipe(take(1))
        .subscribe(data =>{
          this.scanning_done = true;
          //this.alert_controller.dismiss()
          /* .then(() =>{
            this.presentAlertPrompt(data, this.search);
          }) */
        })
      })
    }
  }

  ionViewDidEnter(){
  	//this.showMap();
  }

  back(){
  	window.history.back();
  }

  showMap(){
   	const location = new google.maps.LatLng(this.search.institution_address.lat, 
       this.search.institution_address.lng);
   	const options = {
   		center: location,
   		zoom: 14,
   		disableDefaultUI: true
   	}
   	this.map = new google.maps.Map(this.mapRef.nativeElement, options);
    let moptions: MarkerOptions = {
      position: {lat: this.search.institution_address.lat, lng: this.search.institution_address.lng},
      map: this.map
    }
    this.maps_svc.addMarker(moptions);
  }

  async scanning(search: RoomSearch){
    const alert = await this.alert_controller.create({
      cssClass: 'my-custom-class',
      message:  "Scanning for agents around " + search.institution_and_campus
    });
    return await alert.present();
  }

  async presentAlertPrompt(data: any[], search: RoomSearch) {
    const alert = await this.alert_controller.create({
      cssClass: 'my-custom-class',
      header: 'Agent Scan Results',
      subHeader: Math.floor(data.length*(Math.random()*5 + 10)) + " rooms scanned around " + search.institution_and_campus ,
      message:  data.length + ' results matched',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Self Service',
          handler: () => {
            
          }
        }
      ]
    });

    await alert.present();
  }


}
