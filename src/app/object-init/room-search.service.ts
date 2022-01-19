import { Injectable } from '@angular/core';
import { RoomSearch } from '../models/room-search.model';
import { UsersService } from '../object-init/users.service';
import { PropertiesService } from './properties.service';

@Injectable({
  providedIn: 'root'
})
export class RoomSearchService {

  constructor(private users_svc: UsersService, private ppty_svc: PropertiesService) { }

  defaultRoomSearch(){
  	let roomSearch: RoomSearch = {
		agent: null,
		institution_and_campus: "",
		institution_address: null,
		room_type: "",
		max_price: null,
		funding_type: "",
		parking_needed: false,
		gender_prefference: "",
		preffered_property_type: "",
		searcher: null,
		special_needs: "",
		completed: false,
		id: "",
		time: null
  	}
  	return roomSearch;
  }

  copySearch(_search: RoomSearch){
    let search: RoomSearch = {
      agent: _search.agent || null,
      institution_and_campus: _search.institution_and_campus || "",
      institution_address: _search.institution_address || null,
      room_type: _search.room_type || "",
      max_price: _search.max_price || null,
      funding_type: _search.funding_type || "",
      parking_needed: _search.parking_needed || false,
      gender_prefference: _search.gender_prefference || "",
      preffered_property_type: _search.preffered_property_type || "",
      searcher: _search.searcher || null,
      special_needs: _search.special_needs || "",
      completed: _search.completed || false,
      id: _search.id || "",
      time: _search.time || null
    }
    return search;
  }


}