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
  exclude_these_agents: string[] = [];
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
      let search_sub = this.sf_svc.getSearch(this.actRoute.snapshot.paramMap.get("search_id"))
      .subscribe(sch =>{
        //Initialise search and show map
        this.search = this.room_search_init_svc.copySearch(sch);
        if(!this.map){
          this.showMap();
        }
        //Check if this search has been accepted by and agent, if not, 
        //search for an agent to assign it to, else go to chat
        //with the agent responsible
        if(this.search.agent){
          console.log("The search has been accepted");
          search_sub.unsubscribe()
          this.router.navigate(['/chat', {'search_id': this.search.id}])
        }else{
          //launch search for agent to assign
          console.log("No agent assigned yet");
          this.searchForNextAvailableAgent()
        } 
      })
    }
  }

  ionViewDidEnter(){
  	//this.showMap();
  }

  searchForNextAvailableAgent(){
    let agent_subs = this.sf_svc.getAgentsForSearch(this.search)
    .subscribe(data =>{
      this.scanning_done = true;
      if(data && data.length > 0){
        //Filter agents array and remove those agents that have been tried before
        let _agents = data.filter(agt => this.exclude_these_agents.indexOf(agt.uid) == -1)
        //push job to the agent at the top of the stack and wait for 
        this.agent = _agents.pop();
        //Update the array of agents to be excluded
        this.exclude_these_agents.push(this.agent.uid)
        //
        if(this.agent.current_job == ""){
          //alert agent of job
          this.agent.current_job = this.search.id;
          this.user_svc.updateUser(this.agent);
        }else if(this.agent.current_job == this.search.id && this.agent.contacts.indexOf(this.search.searcher.uid) != -1){
          let index = this.agent.contacts.indexOf(this.search.searcher.uid);
          let thread_id = this.agent.thread_ids[index];
          agent_subs.unsubscribe();
          this.router.navigate(['/chat', {'search_id': this.search.id}])
        }else{
          //take the next agent in the stack
          console.log("Got the wrong agent");
        }
      }
    })
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
    this.router.navigate(['/results', {'search_id': this.search.id, 'client_id': this.search.searcher.uid}])
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
