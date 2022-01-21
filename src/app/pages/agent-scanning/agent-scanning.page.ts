import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ModalController, AlertController, ToastController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { MapsService } from '../../services/maps.service';
import { SearchFeedService } from '../../services/search-feed.service';
import { take } from 'rxjs/operators';
import { RoomSearch } from '../../models/room-search.model';
import { RoomSearchService } from '../../object-init/room-search.service';
import { MarkerOptions } from '../../models/marker-options.model';
import { RoomService } from '../../services/room.service';
import { IonicComponentService } from '../../services/ionic-component.service';
import { User } from 'src/app/models/user.model';
import { UserService } from '../../services/user.service';

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
  agent: User = null;
  scanning_done: boolean = false;
  constructor(
    public modalCtrl: ModalController,
    public toast_controller: ToastController,
    private alert_controller: AlertController, 
    private ionic_component_svc: IonicComponentService,
    private user_svc: UserService,
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
        if(!this.map){
          this.showMap();
        }
        //launch search
        this.sf_svc.getAgentsForSearch(this.search)
        .subscribe(data =>{
          this.scanning_done = true;
          if(data){
            this.toast_controller.dismiss()
            .catch(err =>{
              console.log(err);
            })
            this.agent = data.pop();
            if(this.agent.current_job == ""){
              //alert agent of job
              this.agent.current_job = this.search.id;
            
              this.user_svc.updateUser(this.agent);
            }else if(this.agent.contacts.indexOf(this.search.searcher.uid) != -1){
              let index = this.agent.contacts.indexOf(this.search.searcher.uid);
              let thread_id = this.agent.thread_ids[index];
              this.router.navigate(['/chat', {'thread_id': thread_id}])
            }
          }
        })
      })
    }
  }

  ionViewDidEnter(){
  	//this.showMap();
  }

  updateDisplayPicLoaded(){
    this.agent.dp_loaded = true;
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

  gotoResults(){
    this.router.navigate(['/results', {'search_id': this.search.id}])
  }

  async presentAgentSearchToast(header,iconname,icontext,msg,position,duration) {
    const toast = await this.toast_controller.create({
      header: header,
      message: msg,
      duration: duration,
      color:"thapsblue",
      position: position,
      buttons: [
        {
          text: 'Browse Results On Your Own',
          icon: "chevron-forward-outline",
          cssClass: "toast-button",
          role: 'cancel',
          handler: () => {
            this.gotoResults();
          }
        }
      ]
    });
    toast.present();
  }


}
