import { Injectable } from '@nestjs/common';
import { ChatMute } from 'common';

@Injectable()
export class ChatService {
  admins = new Map<string, Set<string>>();
  owners = new Map<string, string>();
  pass = new Map<string, string>();
  banned = new Map<string, Set<string>>();
  mutes = new Map<string, ChatMute[]>();
  rooms = new Map<string, Set<string>>();
  public = new Set<string>();
  dms = new Set<string>();

  dump() {
    console.log(
      'admins',
      this.admins,
      'owners',
      this.owners,
      'pass',
      this.pass,
      'banned',
      this.banned,
      'mutes',
      this.mutes,
      'rooms',
      this.rooms,
    );
  }

  togglePublic(e: string) {
    if (this.public.has(e)) this.public.delete(e);
    else this.public.add(e);
  }

  toggleBanned(room: string, user: string) {
    const bans = this.getBanned(room);
    if (bans.has(user)) bans.delete(user);
    else bans.add(user);
  }

  guardExists(room: string) {
    if (!this.rooms.has(room)) throw Error(`room ${room} does not exist`);
  }

  guardOwner(room: string, user: string) {
    if (this.owners.get(room) != user)
      throw Error(`you are not the owner of room ${room}`);
  }

  guardBanned(room: string, user: string) {
    if (this.isBanned(room, user)) throw Error(`you are banned in ${room}`);
  }

  guardPass(room: string, pass: string) {
    if ((this.pass.get(room) ?? '') != pass)
      throw Error(`incorrect password for room ${room}`);
  }

  guardAdmin(room: string, user: string) {
    if (!this.isAdmin(room, user))
      throw Error(`you are not an admin in room ${room}`);
  }

  guardUserInRoom(room: string, user: string) {
    if (!this.rooms.get(room)?.has(user))
      throw Error(`you are not in the room ${room}`);
  }

  guardMuted(room: string, user: string) {
    if (this.isMuted(room, user))
      throw Error(`you are muted in the room ${room}`);
  }

  getRole(room: string, user: string) {
    return this.isOwner(room, user)
      ? 'owner'
      : this.isAdmin(room, user)
        ? 'admin'
        : 'user';
  }

  isPublic(room: string) {
    return this.public.has(room);
  }

  isOwner(room: string, user: string) {
    return this.owners.get(room) == user;
  }

  isAdmin(room: string, user: string) {
    return this.getAdmins(room).has(user);
  }

  isBanned(room: string, user: string) {
    return this.getBanned(room).has(user);
  }

  isMuted(room: string, user: string) {
    const mutes = this.mutes.get(room);
    return (
      mutes &&
      mutes.reduce(
        (a, c) =>
          a || (c.user == user && c.date > new Date().getTime()) ? true : false,
        false,
      )
    );
  }

  getOrCreateRoom(id: string, user: string) {
    const room = this.rooms.get(id) ?? new Set();
    if (room.size == 0) {
      this.setOwner(id, user);
      this.toggleAdmin(id, user);
    }
    this.rooms.set(id, room);
    return room;
  }

  addUser(room: string, user: string) {
    this.rooms.get(room)?.add(user);
  }

  delUser(room: string, user: string) {
    const r = this.rooms.get(room);
    if (!r) return;
    r.delete(user);
    if (this.isAdmin(room, user)) this.toggleAdmin(room, user);
    if (this.isOwner(room, user)) this.owners.delete(room);
    if (r.size == 0) {
      this.admins.delete(room);
      this.mutes.delete(room);
      this.banned.delete(room);
      this.public.delete(room);
      this.pass.delete(room);
    }
  }

  setOwner(room: string, user: string) {
    this.owners.set(room, user);
  }

  setPass(room: string, pass: string) {
    this.pass.set(room, pass);
  }

  getAdmins(room: string) {
    const admins = this.admins.get(room) ?? new Set();
    this.admins.set(room, admins);
    return admins;
  }

  toggleAdmin(room: string, user: string) {
    const admins = this.getAdmins(room);
    if (admins.has(user)) admins.delete(user);
    else admins.add(user);
  }

  getBanned(room: string) {
    const bans = this.banned.get(room) ?? new Set();
    this.banned.set(room, bans);
    return bans;
  }

  getDms(user: string) {
    return Array.from(this.dms)
      .filter((v) => v.split('+').includes(user))
      .map((v) => v.split('+').filter((v) => v != user)[0]);
  }

  addDm(user: string, target: string) {
    this.dms.add([user, target].sort().join('+'));
  }

  getPublic() {
    return Array.from(this.public.values());
  }

  addMute(e: ChatMute) {
    //TODO: clear old mutes

    const mutes = this.mutes.get(e.room) ?? [];
    mutes.push(e);
    this.mutes.set(e.room, mutes);
  }
}
