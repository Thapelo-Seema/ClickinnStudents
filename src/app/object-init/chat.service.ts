import { Injectable } from '@angular/core';
import { ChatMessage } from '../models/chat-message.model';
import { ChatThread } from '../models/chat-thread.model';
import { Partnership } from '../models/partnership.model';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor() { }

  defaultMessage(){
    let msg: ChatMessage ={
      appointment: null,
      delivered: false,
      from: "",
      highlight: null,
      message: "",
      message_id: 0,
      read: false,
      recieved: false,
      rooms: [],
      time: 0
    }
    return msg;
  }

  copyMessage(_msg: ChatMessage){
    let msg: ChatMessage ={
      appointment: _msg.appointment || null,
      delivered: _msg.delivered || false,
      from: _msg.from || "",
      highlight: _msg.highlight || null,
      message: _msg.message || "",
      message_id: _msg.message_id || 0,
      read: _msg.read || false,
      recieved: _msg.recieved || false,
      rooms: _msg.rooms || [],
      time: _msg.time || 0
    }
    return msg;
  }

  defaultThread(){
    let thread: ChatThread = {
      chat_messages: [],
      last_message: null,
      last_update: 0,
      new_messages: [],
      thread_id: "",
      agent: null,
      client: null,
      user_1: null,
      user_2: null
    }
    return thread;
  }

  copyThread(_thread: ChatThread){
    let thread: ChatThread = {
      chat_messages: _thread.chat_messages || [],
      last_message: _thread.last_message || null,
      last_update: _thread.last_update || 0,
      new_messages: _thread.new_messages || [],
      thread_id: _thread.thread_id || "",
      agent: _thread.agent || null,
      client: _thread.client || null,
      user_1: null,
      user_2: null
    }

    if(_thread.user_1){
      thread.agent = _thread.user_1;
    }
    if(_thread.user_2){
      thread.client = _thread.user_2;
    }
    return thread;
  }

  defaultPartnership(){
    let partnership: Partnership ={
      firstname: "",
      lastname: "",
      email: "",
      phone_number: "",
      company: "",
      role: "",
      message: "",
      id: "",
      time: 0,
      uid: ""
    }
    return partnership;
  }

  copyPartnership(_p_ship: Partnership){
    let partnership: Partnership ={
      firstname: _p_ship.firstname || "",
      lastname: _p_ship.lastname || "",
      email: _p_ship.email || "",
      phone_number: _p_ship.phone_number || "",
      company: _p_ship.company || "",
      role: _p_ship.role || "",
      message: _p_ship.message || "",
      id: _p_ship.id || "",
      time: _p_ship.time || 0,
      uid: _p_ship.uid || ""
    }
    return partnership;
  }

}
