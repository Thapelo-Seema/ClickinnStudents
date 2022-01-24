import { Component, OnInit } from '@angular/core';
import { ActivatedRoute , Router} from '@angular/router';
import { ModalController,NavController, ToastController} from '@ionic/angular';
import { IonicComponentService} from '../../services/ionic-component.service';
import { RoomService } from '../../services/room.service';
import { BannerItem } from '../../models/banner-item.model';
import { AccommodationSearchPage } from '../accommodation-search/accommodation-search.page';

// import { ShoppingImageGalleryPage } from '../shopping-image-gallery/shopping-image-gallery.page'; // import shopping image gallery component page
// import { ShoppingReviewAddPage } from '../shopping-review-add/shopping-review-add.page';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-banner-details',
  templateUrl: './banner-details.page.html',
  styleUrls: ['./banner-details.page.scss'],
})

export class BannerDetailsPage implements OnInit {
  specialDetail: Observable<any>;
  itemArray: any=[]; 
  specialId: string = "";
  uid: string = "";
  bannerDetail: Observable<BannerItem>;
  constructor(
      private activatedRoute: ActivatedRoute,
      private navController: NavController,
      public toastController: ToastController,
      public router: Router,
      private ionicComponentService: IonicComponentService,
      private modalController: ModalController,
      private room_svc: RoomService
  ) { 
    console.log(this.activatedRoute.snapshot.paramMap.get('specialId'))
    this.specialId = this.activatedRoute.snapshot.paramMap.get('specialId');
    this.uid = this.activatedRoute.snapshot.paramMap.get('uid');
  }

  async ngOnInit() {
    console.log(this.specialId);
    this.bannerDetail = await this.room_svc.getBannerDetails(this.specialId);
  }

  async getSpecialDetail(){
    console.log("getSpectailDetail");
    //this.specialDetail =  await this.accommodationSvc.getBannerDetail( this.specialId);
    //  this.itemSubscribe =  this.item.subscribe(res => {
    //     this.itemArray = res;
    //     this.itemRelated = this.shoppingService.getRelatedItem(this.itemArray.shopping_categoryId , 5);
    //     //********* shopping-item/favorite/userId  ***********//
    //     this.heartType = res.favorite.includes(this.userId) ? 'heart' : 'heart-empty'
    //});
  }

  async close(){
    await this.modalController.dismiss();
  }

  //Open accommodation search modal
  async openSearchModal() {
    await this.modalController.dismiss().catch(err => console.log(err));
    const modal = await this.modalController.create({
      component: AccommodationSearchPage,
      cssClass: "small-modal",
      componentProps: {
        uid: this.uid
      },
      showBackdrop: true
    });
    return await modal.present();
  }

}