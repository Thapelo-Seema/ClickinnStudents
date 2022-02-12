import { Component, OnInit } from '@angular/core';
import { ActivatedRoute , Router} from '@angular/router';
import { ModalController} from '@ionic/angular';
import { UserService } from '../../services/user.service';
import { IonicComponentService} from '../../services/ionic-component.service';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { RoomService } from '../../services/room.service';
import { Room } from 'src/app/models/room.model';
import { FileUpload } from 'src/app/models/file-upload.model';
import { PropertiesService } from '../../object-init/properties.service';
import { ImageGalleryViewPage } from '../image-gallery-view/image-gallery-view.page';
import { Client } from 'src/app/models/client.model';
import { UsersService } from '../../object-init/users.service';
import { RoomSearch } from 'src/app/models/room-search.model';

@Component({
  selector: 'app-room',
  templateUrl: './room.page.html',
  styleUrls: ['./room.page.scss'],
})
export class RoomPage implements OnInit {

  slideOption = {
    slidesPerView: 'auto',
    grabCursor: true
  };

  //Slider configuration 
  slideOptsOne = {
    initialSlide: 0,
    //slidesPerView: 1,
    slidesPerView: 1,
    spaceBetween: 30,
    freeMode: true,
    //autoplay: true
  };


  parentPath:any;
  uploader_pic_loaded: boolean = false;
  client_id: string = '';

  //****** image slide  *******/
  sliderOpts = {
    slidesPerView: 2.5
  };

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
  agentDetail: Observable<any>;
  relatedPlacesArray: any=[];
  reviews: Observable<any[]>;

  itemId: any;
  categoryId: any;
  itemArray: any=[]; // <------- itemArray: any=[]; 

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
      private ionicComponentService: IonicComponentService,
      private modalController: ModalController,
      private room_svc: RoomService,
      private property_svc: PropertiesService
  ) { 
    this.room = this.property_svc.defaultRoom();
    this.client = this.user_init_svc.defaultClient();
  }

  ngOnInit() {
    
  }

  ionViewWillEnter(){
    if(this.activatedRoute.snapshot.paramMap.get("room_id")){
      this.ionicComponentService.presentLoading()
      this.room_svc.getRoom(this.activatedRoute.snapshot.paramMap.get('room_id'))
      .pipe(take(1))
      .subscribe(rm =>{
        this.room = rm;
        this.rooms = this.room_svc.getPropertyRooms(rm.property.address)
        this.ionicComponentService.dismissLoading().catch(err => console.log(err))
        this.room.pictures.forEach(p =>{
          this.pictures.push(p);
        });
        this.room.property.shared_area_pics.forEach(p =>{
          this.pictures.push(p);
        })
        this.room.property.pictures.forEach(p =>{
          this.pictures.push(p);
        })
        console.log(this.pictures);
        //this.ionicComponentService.dismissLoading().catch(err => console.log(err))
      })
    }
    if(this.activatedRoute.snapshot.paramMap.get("client_id")){
      this.client_id = this.activatedRoute.snapshot.paramMap.get("client_id");
      this.userService.getClient(this.client_id)
      .pipe(take(1))
      .subscribe(clt =>{
        this.client = this.user_init_svc.copyClient(clt);
      })
    }
  }

  ngOnDestroy() {
		//this.sub.unsubscribe()
  }

  updateDisplayPicLoaded(){
    this.uploader_pic_loaded = true;
  }

  openDetail(accommodationId) {
    console.log("Navigating to room: ", accommodationId)
    this.router.navigate(['/room', {'room_id': accommodationId, 'client_id': this.client.uid}]);
  }

  openPic(pic){
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
  }

  gotoAppointment(){
    this.router.navigate(['/appointment', {'rooms': [this.room.room_id], 
    'agent_id': this.room.property.uploader_id, 'client_id':  this.client_id}]);
  }

  chat(){
    
    this.router.navigate(['/chat', {'rooms': [this.room.room_id], 'source': 'room',
    'agent_id': this.room.property.uploader_id, 'client_id':  this.client_id}]);
  }

  async getPlaceDetail(){

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


  }

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

  updateRoomDisplayPicLoaded(){
    this.room.dp_loaded = true;
  }

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
  contactAction(action: string){
    this.ionicComponentService.presentToast(action,3000);
  }

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

  /* sendMail(search: Search){
    let msg: string = `Hi my name is ${this.user.firstname}, I am responding to your search on Clickinn.\n`;
    if(search.apartment_type == 'Any'){
        msg += `I'd like to enquire if you're still looking for any room type 
        around ${this.returnFirst(search.Address.description)}. If you are still looking please contact me on ${this.user.phoneNumber} or email me on ${this.user.email}`
    }else{
        msg += `I'd like to enquire if you're still looking for
         a ${search.apartment_type} around ${this.returnFirst(search.Address.description)}`
    }
    this.searchfeed_svc.sendMail(search, this.user.firstname, msg)
    .subscribe(res =>{
      console.log(res)
    }, err =>{
      console.log(err);
    })
  } */

  /* formatContactNumber(search: Search): string{
    let newNumber = search.searcher_contact ? search.searcher_contact: "";
    if(search.searcher_contact != undefined){
      if(search.searcher_contact.substring(0, 1) == "0"){
          newNumber = "+27" + search.searcher_contact.substring(1);
        }else if(search.searcher_contact.substring(0, 1) == "+"){
          newNumber = search.searcher_contact;
        }
        else if(search.searcher_contact.substring(0, 1) == "27"){
          newNumber = "+" + search.searcher_contact;
        }
    }
    return newNumber;
  } */

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

  /* whatsAppNumberStatus(search: Search){
    if(search.searcher_contact != null && search.searcher_contact != ""  
      && search.contact_on_WhatsApp && search.searcher_contact != undefined){

    }else{
      let toast = this.toastCtrl.create({
        duration: 3000,
        message: "No WhatsApp number provided, sending email..."
      })
      toast.present();
      this.sendMail(search);
    }
  } */

}
