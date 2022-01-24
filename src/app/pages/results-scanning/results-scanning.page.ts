import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { ScannerPopupPage } from '../../modals/scanner-popup/scanner-popup.page';
import { MapsService } from '../../services/maps.service';
import { SearchFeedService } from '../../services/search-feed.service';
import { take } from 'rxjs/operators';
import { RoomSearch } from '../../models/room-search.model';
import { RoomSearchService } from '../../object-init/room-search.service';
import { MarkerOptions } from '../../models/marker-options.model';
import { RoomService } from '../../services/room.service';
import { Room } from 'src/app/models/room.model';

declare var google: any;

@Component({
  selector: 'app-results-scanning',
  templateUrl: './results-scanning.page.html',
  styleUrls: ['./results-scanning.page.scss'],
})
export class ResultsScanningPage implements OnInit {

  @ViewChild('map', {read: ElementRef, static: false}) mapRef: ElementRef;
  map: any;
  search: RoomSearch;
  scanning_done: boolean = false;
  rooms: Room[] = [];
  area_snap: Room[] = [];
  constructor(
    public modalCtrl: ModalController,
    private alert_controller: AlertController, 
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
        this.search = this.room_search_init_svc.copySearch(sch);
        this.showMap();
        //Get all properties in the area
        this.sf_svc.getAllRoomsInArea(sch)
        .pipe(take(1))
        .subscribe(rms =>{
          this.area_snap = rms;
        })
        //launch search
        this.sf_svc.getRoomSearchResults(this.search)
        .pipe(take(1))
        .subscribe(data =>{
          this.scanning_done = true;
          this.rooms = data;
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

  gotoResults(){
    this.router.navigate(['/results', {'search_id': this.search.id, 'client_id': this.search.searcher.uid}])
  }

  gotoCallCenter(){
    this.router.navigate(['/agent-scanning', {'search_id': this.search.id}])
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

  async filters(data: any[], search: RoomSearch){
  	const modal = await this.modalCtrl.create({
  		component: ScannerPopupPage,
      cssClass: 'modalClass',
  		componentProps: {
  			'filterType': 'all',
        'results_scanned': Math.floor(data.length*(Math.random()*5 + 10)), //random multiplier (10-15)
        'results_matched': data.length,
        'search_institution': search.institution_and_campus || "" + " " + 
        search.institution_address.neighbourhood,
        'search_id': this.search.id
  		}
  	});
  	return await modal.present();
  }

  async presentAlertPrompt(data: any[], search: RoomSearch) {
    const alert = await this.alert_controller.create({
      cssClass: 'my-custom-class',
      header: 'Area Scan Results',
      subHeader: Math.floor(data.length*(Math.random()*5 + 10)) + " rooms scanned around " + search.institution_and_campus ,
      message:  data.length + ' results matched',
      /* inputs: [
        {
          name: 'name1',
          type: 'text',
          placeholder: 'Placeholder 1'
        },
        {
          name: 'name2',
          type: 'text',
          id: 'name2-id',
          value: 'hello',
          placeholder: 'Placeholder 2'
        },
        // multiline input.
        {
          name: 'paragraph',
          id: 'paragraph',
          type: 'textarea',
          placeholder: 'Placeholder 3'
        },
        {
          name: 'name3',
          value: 'http://ionicframework.com',
          type: 'url',
          placeholder: 'Favorite site ever'
        },
        // input date with min & max
        {
          name: 'name4',
          type: 'date',
          min: '2017-03-01',
          max: '2018-01-12'
        },
        // input date without min nor max
        {
          name: 'name5',
          type: 'date'
        },
        {
          name: 'name6',
          type: 'number',
          min: -5,
          max: 10
        },
        {
          name: 'name7',
          type: 'number'
        }
      ] */
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'See results',
          handler: () => {
            
          }
        }
      ]
    });

    await alert.present();
  }


}