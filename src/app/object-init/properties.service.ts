import { Injectable } from '@angular/core';
import { Property } from '../models/property.model';
//import { PropertyPreview } from '../models/property-preview.model';
import { Address } from '../models/address.model';
import { Room } from '../models/room.model';
//import { RoomPreview } from '../models/room-preview.model';
//import { RoomCount } from '../models/room.count.interface';
import { FileUpload } from '../models/file-upload.model';
import { RoomCount } from '../models/room-count.model';
import { RoomPreview } from '../models/room-preview.model';
import { PropertyPreview } from '../models/property-preview.model';


@Injectable({
  providedIn: 'root'
})
export class PropertiesService {

  constructor() { }

  /* defaultRoomCount(){
  	let room_count: RoomCount = {
  		singles: null,
  		two_sharings: null,
  		three_sharings: null,
  		cottages: null,
  		apartments: null,
  		backrooms: null,
  		ensuites: null
  	}
  	return room_count;
  }

  defaultPropertyPreview(){
  	let property: PropertyPreview = {
  		address: this.defaultAddress(),
		parking: false,
		wifi: false,
		payment_methods: "",
		pool: false,
		gym: false,
		laundry: false,
		tv_room: false,
		security: false,
		electricity_inclusive_in_rent: false,
		property_id: "",
		property_type: "",
		nearby_landmarks: [],
		deposit_specifics: [],
		other_amenities: "",
		genders_housed: ""
	}
  	return property;
  }
 */
  defaultAddress(): Address{
  	let address: Address ={
  		lat: 0,
  		lng: 0,
  		country: "",
  		province: "",
  		city: "",
  		neighbourhood: "",
  		street: "",
  		house_number: "",
  		place_name: ""
  	}
  	return address
  }

  defaultRoom(): Room{
  	let room: Room = {
  		available: true,
  		accredited: false,
		display_pic_url: "",
		dp_loaded: false,
		description: "",
		pictures: [],
		video_url: "",
		video: null,
		room_id: "",
		occupants: [],
		furnished: false,
		room_type: "",
		search_rating: 0,  
		demand_index: 0,   
		rent: null,
		deposit: null,
		room_number: "",
		sub_rooms: 0,
		property: this.defaultProperty(),
		time_modified: 0,
		time_uploaded: 0
  	}
  	return room;
  }

  defaultRoomPreview(){
	  let room_prev: RoomPreview ={
		available: false,
		accredited: false,
		display_pic_url: "",
		dp_loaded: false,
		room_id: "",
		furnished: false,
		room_type: "",   
		rent: null,
		property: this.defaultPropertyPreview(),
		time_modified: 0,
		time_uploaded: 0
	  }
	  return room_prev;
  }

  initRoomPreview(_room: Room){
	let room: RoomPreview = {
		accredited: _room.accredited || false,
		available: _room.available || false,
		display_pic_url: _room.display_pic_url || _room.pictures[0].url,
		dp_loaded: _room.dp_loaded || false,
		room_id: _room.room_id || "",
		furnished: _room.furnished || false,
		room_type: _room.room_type || "",   
		rent: _room.rent || null,
		property: this.initializePropertyPreview(_room.property) || this.defaultPropertyPreview(),
		time_modified: _room.time_modified || 0,
		time_uploaded: _room.time_uploaded || 0
	}
	return room;
  }

  copyRoom(_room: Room){
	let room: Room = {
		available: _room.available || true,
		accredited: _room.accredited || false,
		display_pic_url: _room.display_pic_url || "",
		dp_loaded: _room.dp_loaded || false,
		description: _room.description || "",
		pictures: _room.pictures || [],
		video_url: _room.video_url || "",
		video: _room.video || null,
		room_id: _room.room_id || "",
		occupants: _room.occupants || [],
		furnished: _room.furnished || false,
		room_type: _room.room_type || "",
		search_rating: _room.search_rating || 0,  
		demand_index: _room.demand_index || 0,   
		rent: _room.rent || null,
		deposit: _room.deposit || null,
		room_number: _room.room_number || "",
		sub_rooms: _room.sub_rooms || 0,
		property: _room.property || this.defaultProperty(),
		time_modified: _room.time_modified || 0,
		time_uploaded: _room.time_uploaded || 0
	}
	return room;
  }

  

  initializedRoom(type: string,  rm_number: string, is_furnished?: boolean){
  	let room: Room = {
  		available: true,
  		accredited: false,
		display_pic_url: "",
		dp_loaded: false,
		description: "",
		pictures: [],
		video_url: "",
		room_id: "",
		occupants: [],
		furnished: is_furnished || false,
		room_type: type,
		search_rating: 0,  
		demand_index: 0,   
		rent: null,
		deposit: null,
		room_number: rm_number,
		sub_rooms: 0,
		property: this.defaultProperty()
  	}
  	return room;
  }

  defaultProperty():Property{
  	let property: Property = {
  		address: this.defaultAddress(),
  		accredited: false,
		parking: false,
		wifi: false,
		payment_methods: "",
		pool: false,
		gym: false,
		laundry: false,
		tv_room: false,
		security: false,
		electricity_inclusive_in_rent: false,
		landlord_id: "",
		agents: [],
		property_id: "",
		service_package: "",
		display_pic_url: "",
		dp_loaded: false,
		pictures: [],
		shared_area_pics: [],
		num_pics_downloaded: 0,
		num_pics_uploaded: 0,
		video_url: "",
		video: null,
		property_type: "",
		property_paid_off: false,
		nearby_landmarks: [],
		minutes_from_campus: null,
		upload_complete: 0,
		uploader_id: "",
		uploader_name: "",
		uploader_pic: "",
		deposit_specifics: "",
		uploader_contact_number: "",
		other_amenities: "",
		genders_housed: "",
		rooms: this.defaultRoomCount()
  	}
  	return property;
  }

  defaultPropertyPreview(){
	let property: PropertyPreview = {
		address: this.defaultAddress(),
		landlord_id: "",
		property_id: "",
		display_pic_url: "",
		dp_loaded: false,
		uploader_id: "",
		parking: false
	}
	return property;
  }

  initializePropertyPreview(_property: Property){
	let property: PropertyPreview = {
		address: _property.address || this.defaultAddress(),
		landlord_id: _property.landlord_id || "",
		property_id: _property.property_id || "",
		display_pic_url: _property.display_pic_url || "",
		dp_loaded: _property.dp_loaded,
		uploader_id: _property.uploader_id || "",
		parking: _property.parking || false
	}
	return property;
  }

  defaultFileUpload(){
  	let fl: FileUpload = {
  		file: null,
		path: "",
		url: "",
		name: "",
		progress: 0,
		loaded: false
	}
	return fl;
  }

  defaultRoomCount(){
	  let room_count: RoomCount = {
		singles: 0,
		two_sharings: 0,
		three_sharings: 0,
		cottages: 0,
		backrooms: 0,
		bachelors: 0,
		ensuite_singles: 0,
		ensuite_two_sharings: 0,
		ensuite_three_sharings: 0
	  }
	  return room_count;
  }
  
}