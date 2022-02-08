import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Room } from '../models/room.model';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { RoomSearch } from '../models/room-search.model';
import { LocationGraphService } from './location-graph.service';
import { User } from '../models/user.model';
import { UsersService } from '../object-init/users.service';

@Injectable({
  providedIn: 'root'
})
export class SearchFeedService {

  constructor(
    private afs: AngularFirestore,
    private user_init_svc: UsersService,
    private location_graph_svc: LocationGraphService) { }

  createSearchOnFeed(search: RoomSearch){
    return this.afs.collection<RoomSearch>('SearchFeed').add(search);
  }

  getSearch(search_id: string){
    return this.afs.collection<RoomSearch>('SearchFeed').doc(search_id).valueChanges();
  }

  updateSearch(search: RoomSearch){
    return this.afs.collection('SearchFeed').doc(search.id).update(search);
  }

  getPropertyRooms(property_id: string){
		return this.afs.collection<Room>('Rooms', ref => ref.where('property.property_id', '==', property_id))
		.valueChanges();
	}

  defaultSearch(){
    let search: RoomSearch = {
      agent: this.user_init_svc.defaultUser(),
      agents_cancelled:  [],
      institution_and_campus: "",
      institution_address: null,
      room_type: "",
      max_price: 0,
      funding_type: "",
      parking_needed: false,
      gender_prefference: "",
      preffered_property_type: "",
      searcher: this.user_init_svc.defaultClient(),
      special_needs: "",
      completed: false,
      id: "",
      time: 0
    }
    return search;
  }

  copySearch(_search: RoomSearch){
    let search: RoomSearch = {
      agent: _search.agent || this.user_init_svc.defaultUser(),
      agents_cancelled: _search.agents_cancelled || [],
      institution_and_campus: _search.institution_and_campus || "",
      institution_address: _search.institution_address || null,
      room_type: _search.room_type || "",
      max_price: _search.max_price || 0,
      funding_type: _search.funding_type || "",
      parking_needed: _search.parking_needed || false,
      gender_prefference: _search.gender_prefference || "",
      preffered_property_type: _search.preffered_property_type || "",
      searcher: _search.searcher || this.user_init_svc.defaultClient(),
      special_needs: _search.special_needs || "",
      completed: _search.completed || false,
      id: _search.id || "",
      time: _search.time || 0
    }
    return search;
  }

  getAllRoomsInArea(search: RoomSearch){
    let locations: string[] = [];
    //generate a list of surrounding areas
    if(this.location_graph_svc.auckland_park_neighbourhoods.indexOf(search.institution_address.neighbourhood) != -1){
      locations = this.location_graph_svc.auckland_park_neighbourhoods;
    }else{
      locations = this.location_graph_svc.auckland_park_neighbourhoods;
    }
    for(let i = 0; i < locations.length - 1; i++){
      locations[i] = locations[i].charAt(0).toUpperCase() + locations[i].slice(1);
    }
    return this.afs.collection<Room>("Rooms", ref => 
    ref.where("property.address.neighbourhood", "in" , locations))
    .valueChanges()
  }

  /**
    Function for getting room search results from firebase cloud functions
    @params search which is a RoomSearch object to used for querying the search
    database and updating searchfeed table.
    @return an ordered list of matching room results with the most relevant results
    at the top
    */
    getRoomSearchResults(search: RoomSearch): Observable<any[]>{
      let locations: string[] = [];
      //generate a list of surrounding areas
      if(this.location_graph_svc.auckland_park_neighbourhoods.indexOf(search.institution_address.neighbourhood) != -1){
        locations = this.location_graph_svc.auckland_park_neighbourhoods;
      }else{
        locations = this.location_graph_svc.auckland_park_neighbourhoods;
      }
      //Capitalize the first character in the location name for easy comparison
      for(let i = 0; i < locations.length - 1; i++){
        locations[i] = locations[i].charAt(0).toUpperCase() + locations[i].slice(1);
      }

      if (search.parking_needed === true) {
        if (search.room_type === "Any Room Type") {
          if (search.funding_type === "NSFAS funded") {
            return this.afs.collection("Rooms", ref =>
            ref.where("property.address.neighbourhood", "in", locations)
            .where("property.parking", "==", true)
            .where("accredited", "==", true)
            .limit(30)).valueChanges();
          } else {
            return this.afs.collection("Rooms", ref =>
            ref.where("property.address.neighbourhood", "in", locations)
            .where("rent", "<=", search.max_price)
            .where("property.parking", "==", true)
            .orderBy("rent", "asc")
            .limit(30)).valueChanges();
          }
        }else {
          if (search.funding_type === "NSFAS funded") {
            return this.afs.collection("Rooms", ref =>
            ref.where("property.address.neighbourhood", "in", locations)
            .where("room_type", "==", search.room_type)
            .where("property.parking", "==", true)
            .where("accredited", "==", true)
            .limit(30))
            .valueChanges();
          } else {
          return this.afs.collection("Rooms", ref =>
          ref.where("property.address.neighbourhood", "in", locations)
          .where("rent", "<=", search.max_price)
          .where("room_type", "==", search.room_type)
          .where("property.parking", "==", true).orderBy("rent", "asc")
          .limit(30)).valueChanges();
        }
      }
    } else {
      if (search.room_type === "Any Room Type") {
        if (search.funding_type === "NSFAS funded") {
          return this.afs.collection("Rooms", ref =>
          ref.where("property.address.neighbourhood", "in", locations)
          .where("accredited", "==", true)
          .limit(30)).valueChanges();
        } else {
          return this.afs.collection("Rooms", ref =>
          ref.where("property.address.neighbourhood", "in", locations)
          .where("rent", "<=", search.max_price).orderBy("rent", "asc")
          .limit(30)).valueChanges();
        }
      } else {
        if (search.funding_type === "NSFAS funded") {
          return this.afs.collection("Rooms", ref =>
          ref.where("property.address.neighbourhood", "in", locations)
          .where("room_type", "==", search.room_type)
          .where("accredited", "==", true)
          .limit(30)).valueChanges();
        } else {
          return this.afs.collection("Rooms", ref =>
          ref.where("property.address.neighbourhood", "in", locations)
          .where("room_type", "==", search.room_type)
          .where("rent", "<=", search.max_price).orderBy("rent", "asc")
          .limit(30)).valueChanges();
        }
      }
    }

    
    /*const results = await resultsQuery.get();
    let arr: any[] = [];
    results.forEach(res =>{
      arr.push(res.data())
    })*/
    
    /*if(! search.agent){
      this.searchfeed_svc.addSearchToFeed(search);
    }
    let url = "https://us-central1-clickinn-996f0.cloudfunctions.net/searchPlace";
    const headers = new HttpHeaders();
    headers.append("Access-Control-Allow-Origin", "*");
    return this.http.post(url, search, {headers});*/
  }

  getAgentsForSearch(search: RoomSearch){
    return  this.afs.collection<User>('Agents', ref =>
         ref.where("neighbourhoods", "array-contains", search.institution_address.neighbourhood)
            .where("online", "==", true)
            .where("busy_with_job", "==", false)
      ).valueChanges()
  }

  getPlacesForCampus(search: RoomSearch){
    let locations: string[] = [];
      //generate a list of surrounding areas
      if(this.location_graph_svc.auckland_park_neighbourhoods.indexOf(search.institution_address.neighbourhood) != -1){
        locations = this.location_graph_svc.auckland_park_neighbourhoods;
      }else{
        locations = this.location_graph_svc.auckland_park_neighbourhoods;
      }
      //Capitalize the first character in the location name for easy comparison
      for(let i = 0; i < locations.length; i++){
        locations[i] = locations[i].charAt(0).toUpperCase() + locations[i].slice(1);
      }
    return this.afs.collection<Room>("Rooms", ref =>
    ref.where("property.address.neighbourhood", "in", locations))
    .valueChanges()
  }
}
