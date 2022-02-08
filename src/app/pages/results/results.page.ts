import { Component, OnInit } from '@angular/core';
import { RoomSearch } from '../../models/room-search.model';
import { RoomSearchService } from '../../object-init/room-search.service';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicComponentService } from '../../services/ionic-component.service';
import { SearchFeedService } from '../../services/search-feed.service';
import { Room } from 'src/app/models/room.model';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-results',
  templateUrl: './results.page.html',
  styleUrls: ['./results.page.scss'],
})
export class ResultsPage implements OnInit {

  rooms: Room[] = [];
  search: RoomSearch;
  i = 0;
  show_search: boolean = false;
  constructor(
    private ionic_component_svc: IonicComponentService,
    private activated_route: ActivatedRoute, 
    private router: Router, 
    private searchfeed_svc: SearchFeedService,
    private room_search_init_svc: RoomSearchService) { 
      this.search  = this.searchfeed_svc.defaultSearch();
    }

  ngOnInit(){
    this.ionic_component_svc.presentLoading();
    if(this.activated_route.snapshot.paramMap.get('search_id')){
      if(this.activated_route.snapshot.paramMap.get('search_id')){
        this.search.id = this.activated_route.snapshot.paramMap.get('search_id');
        this.searchfeed_svc.getSearch(this.search.id)
        .pipe(take(1))
        .subscribe(sch =>{
          if(sch){
            this.search = this.room_search_init_svc.copySearch(sch);
            this.searchfeed_svc.getPlacesForCampus(sch)
            .pipe(take(2))
            .subscribe(rms =>{
              this.ionic_component_svc.dismissLoading().catch(err => console.log(err))
              this.rooms = rms;
            })
          }
        })
      }else{
        this.search.id = this.activated_route.snapshot.paramMap.get('search_id');
        this.searchfeed_svc.getSearch(this.search.id)
        .pipe(take(1))
        .subscribe(sch =>{
          if(sch){
            this.search = this.room_search_init_svc.copySearch(sch);
            this.searchfeed_svc.getRoomSearchResults(sch)
            .pipe(take(2))
            .subscribe(rms =>{
              this.ionic_component_svc.dismissLoading().catch(err => console.log(err))
              this.rooms = rms;
            })
          }
        })
      }
    }
  }

  gotoRoom(room: Room){
    this.router.navigate(['/room', {'room_id': room.room_id, 'client_id': this.search.searcher.uid}]);
  }

  urlEncodedMessge(): string{
    let msg: string = `Hi my name is ${this.search.searcher.firstname}, here is my search:.\n`;
    msg += "https://clickinn.co.za/results;search_id=" + this.search.id + ";client_id=" + this.search.searcher.uid;
    return encodeURI(msg);
  }

  //Send a follow up
  generateWhatsAppLink(): string{
    //this.submitAgentService();
    let msg: string = this.urlEncodedMessge();
    return `https://wa.me/+27671093186?text=${msg}`;
  }

  
  seeSearch(){
    this.i++
    if(this.i > 10){
      this.show_search = true;
    }
  }

  close(){
    this.i = 0;
    this.show_search = false;
  }

}
