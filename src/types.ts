export interface Activity {
  id: string;
  title: string;
  category: string;
  time: string;
  attendees: number;
  lat: number;
  lng: number;
  icon: string;
  userAvatar: string;
  userName: string;
  description: string;
  authorUid?: string;
  createdAt?: any;
}

export interface Message {
  id: string;
  text: string;
  sender: string;
  senderUid: string;
  timestamp: string;
  activityId: string;
}
