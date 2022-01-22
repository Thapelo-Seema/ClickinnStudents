import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ChatThread } from '../models/chat-thread.model';
import { Partnership } from '../models/partnership.model';

@Injectable({
  providedIn: 'root'
})
export class ChattService {

  constructor(private afs: AngularFirestore) { }

  createThread(thread: ChatThread){
    return this.afs.collection('ChatThreads').add(thread);
  }

  createPartnership(partnership: Partnership){
    return this.afs.collection('Partnerships').add(partnership);
  }

  getThread(thread_id){
    return this.afs.collection<ChatThread>('ChatThreads').doc(thread_id).valueChanges();
  }

  updateThread(thread: ChatThread){
    return this.afs.collection('ChatThreads').doc(thread.thread_id).update(thread);
  }

  updatePartnership(partnership: Partnership){
    return this.afs.collection('Partnerships').doc(partnership.id).update(partnership);
  }

  getUserThreads(uid){
    return this.afs.collection<ChatThread>('ChatThreads', ref =>
    ref.where("agent.uid", "==", uid)
    .orderBy("last_update", "desc")).valueChanges();
  }


}
