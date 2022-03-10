import { Component} from '@angular/core';
import { ActivatedRoute , Router} from '@angular/router';
import { UserService } from '../../services/user.service';
import { IonicComponentService} from '../../services/ionic-component.service';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { RoomService } from '../../services/room.service';
import { Room } from 'src/app/models/room.model';
import { FileUpload } from 'src/app/models/file-upload.model';
import { PropertiesService } from '../../object-init/properties.service';
import { Client } from 'src/app/models/client.model';
import { UsersService } from '../../object-init/users.service';
import { AuthService } from '../../services/auth.service';
//import { RoomSearch } from 'src/app/models/room-search.model';

@Component({
  selector: 'app-room',
  templateUrl: './room.page.html',
  styleUrls: ['./room.page.scss'],
})
export class RoomPage {

  //parentPath:any;
  uploader_pic_loaded: boolean = false;
  client_id: string = '';

  //**** toolbar for hide and show ****/
  showToolbar = false;
  showColor = false;
  showTitle = false;
  transition:boolean = false;

  //**** favorite  ****/
  favorite: boolean = false;
  favArray: any;
  heartType: string = "heart-empty";

  recommenedItems: Observable<any[]>;
  itemDetail: Observable<any>;
  //relatedPlaces:Observable<any[]>;
  //agentDetail: Observable<any>;
  //relatedPlacesArray: any=[];
  //reviews: Observable<any[]>;

  //itemId: any;
  //categoryId: any;
  //itemArray: any=[]; // <------- itemArray: any=[]; 

  //**** User authentication  ****/
  userAuth: boolean = false; // Is user logged in ?
  userId: any;
  room: Room;
  rooms: Observable <Room[]>;
  pictures: FileUpload[] = [];
  client: Client;

  constructor(
      public userService: UserService,
      private activatedRoute: ActivatedRoute,
      private user_init_svc: UsersService,
      public router: Router,
      private authService: AuthService,
      private ionicComponentService: IonicComponentService,
      private room_svc: RoomService,
      private property_svc: PropertiesService
  ) { 
    this.room = this.property_svc.defaultRoom();
    this.client = this.user_init_svc.defaultClient();
  }

  ionViewWillEnter(){
    this.ionicComponentService.presentLoading();
    this.authService.getAuthenticatedUser()
    .pipe(take(1))
    .subscribe(usr =>{
      if(usr && usr.uid){
        //This will run if we have an authenticated user
        this.client.uid = usr.uid;
        this.fetchExistingClient();
        this.fetchRoomDetails();
        this.ionicComponentService.dismissLoading().catch(err => console.log(err))
      }else{
        this.signUpAnonymouslyAndFetchRoomDetails();
        this.ionicComponentService.dismissLoading().catch(err => console.log(err))
      }
    },
    err =>{
      this.signUpAnonymouslyAndFetchRoomDetails();
      this.ionicComponentService.dismissLoading().catch(err => console.log(err))
    })
  }
  
  fetchRoomDetails(){
    if(this.activatedRoute.snapshot.paramMap.get("room_id")){
      this.room_svc.getRoom(this.activatedRoute.snapshot.paramMap.get('room_id'))
      .pipe(take(1))
      .subscribe(rm =>{
        this.room = rm;
        this.rooms = this.room_svc.getPropertyRooms(rm.property.address)
        this.room.pictures.forEach(p =>{
          this.pictures.push(p);
        });
        this.room.property.shared_area_pics.forEach(p =>{
          this.pictures.push(p);
        })
        this.room.property.pictures.forEach(p =>{
          this.pictures.push(p);
        })
      })
    }
  }
  
  fetchExistingClient(){ 
    //console.log("Fetching existing client...", this.client.uid)
    this.userService.getClient(this.client.uid)
    .subscribe((u) =>{
      if(u){
        //console.log("Got persisted client...", u)
        this.client = this.user_init_svc.copyClient(u);
      }else{
        //If the logged on user is not persited on the database
        //console.log("User loggeed on but does not exist on the database");
        this.client.user_type = "client";
        //console.log("Cached client was not persited on db...persisting: ", this.user)
        this.userService.createClient(this.client)
        .catch(err => {
          console.log(err)
        })
      }
    })
  }

  //Authenticate on firebase but check also if there's a client saved offline and allow this client to use the authstate
  signUpAnonymouslyAndFetchRoomDetails(){
    this.authService.signUpAnonymously().then(dat =>{
      //console.log("User is now authenticated...");
      this.client.uid = dat.user.uid;
      this.client.user_type = "client";
      this.fetchRoomDetails();
      this.userService.createClient(this.client)
      .catch(err => {
        console.log(err)
      })
    })
    .catch(err =>{
      console.log(err)
    })
  }

  updateDisplayPicLoaded(){
    this.uploader_pic_loaded = true;
  }

  openDetail(accommodationId) {
    console.log("Navigating to room: ", accommodationId)
    this.router.navigate(['/room', {'room_id': accommodationId, 'client_id': this.client.uid}]);
  }

  /* openPic(pic){
    console.log("openImageViewer")
    // let modal = this.modalCtrl.create(CartPage, { data: this.cart });
   this.modalController.create({
     component: ImageGalleryViewPage,
     cssClass: 'fullscreen-modal',
     componentProps: {
       data: this.pictures,
       index: pic
     }
   }).then(modal => {
     modal.present();
   });
  } */

  gotoAppointment(){
    this.router.navigate(['/appointment', {'rooms': [this.room.room_id], 
    'agent_id': this.room.property.uploader_id, 'client_id':  this.client_id}]);
  }

 /*  chat(){
    this.router.navigate(['/chat', {'rooms': [this.room.room_id], 'source': 'room',
    'agent_id': this.room.property.uploader_id, 'client_id':  this.client_id}]);
  } */

  /* async getPlaceDetail(){

    //this.itemDetail =  await this.realestateService.getHouseDetail( this.itemId);

    // get image gallery from place doc.
    await this.itemDetail.subscribe(res => {

      // console.log("4 getPlacesDetail subsribe = "+res);
      // console.log("5 getPlacesDetail subsribe = "+JSON.stringify(res)); 

      this.itemArray = res;
      console.log("______this.itemArray.agentId"+this.itemArray.agentId);
      //this.agentDetail =   this.realestateService.getAgentDetail( this.itemArray.agentId);


      console.log("6 this.itemArray/images="+this.itemArray.images);
      console.log("7 this.itemArray.travel_categoryId="+this.itemArray.travel_categoryId);


      //this.getRelatedPlace(this.itemArray.travel_categoryId);



      ///%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%... where are this.userID....?????????????????
      this.heartType = res.favorite.includes(this.userId) ? 'heart' : 'heart-empty'
  
      
    });


  } */

  toggleHeart() {
		if(this.heartType == 'heart-empty') {
      console.log("Heart ON");
      /* this.realestateService.addFavorite(
        this.itemId,
        this.itemArray.title, 
        this.itemArray.image_header); */

		} else {
      console.log("Heart OFF");
      //this.realestateService.removeFavorite(this.itemId);
		}
	}

 /*  updateRoomDisplayPicLoaded(){
    this.room.dp_loaded = true;
  } */

  onScroll($event) {
    if ($event && $event.detail && $event.detail.scrollTop) {
      const scrollTop = $event.detail.scrollTop;
      this.transition = true;
      this.showToolbar = scrollTop >= 20;
     // console.log("showToolbar="+this.showToolbar);
      this.showTitle = scrollTop >= 20;
      //console.log("showTitle="+this.showTitle);
    }else{
      this.transition = false;
    }
  }

  /* contactAction(action: string){
    this.ionicComponentService.presentToast(action,3000);
  } */

  /* async openMap() {
    console.log("openModal");
    const modal = await this.modalController.create({
      component: RealMapPage,
      cssClass: 'my-custom-modal-css',
      componentProps: {
        categoryId: "buy"
      }
    });
    return await modal.present();
  } */
  

  urlEncodedMessge(): string{
    let msg: string = `Hi my name is ${this.client.firstname}, I would like to enquire if this room is still available.\n`;
    msg += "https://clickinn.co.za/room;room_id=" + this.room.room_id;
    return encodeURI(msg);
  }

  urlEncodedShareMessge(): string{
    let msg = "https://clickinn.co.za/room;room_id=" + this.room.room_id;
    return encodeURI(msg);
  }

  urlEncodedSecuredRoomMessge(): string{
    let msg: string = `Hi my name is ${this.client.firstname}, I have secured the ${this.room.room_type} at 
    ${this.room.property.address.place_name}.\n`;
    msg += "Room price: " + this.room.accredited ? "NSFAS RATE.\n" : "R" + this.room.rent + "\n"; 
    msg += "https://clickinn.co.za/room;room_id=" + this.room.room_id;
    return encodeURI(msg);
  }

  //Send a follow up
  generateWhatsAppLink(): string{
    //Composing message
    let msg: string = this.urlEncodedMessge();
    return `https://wa.me/+27671093186?text=${msg}`;
  }

  share(){
    let msg: string = this.urlEncodedShareMessge();
    return `https://wa.me/?text=${msg}`;
  }

  secured(){
    let msg: string = this.urlEncodedSecuredRoomMessge();
    return `https://wa.me/+27671093186?text=${msg}`;
  }

}
