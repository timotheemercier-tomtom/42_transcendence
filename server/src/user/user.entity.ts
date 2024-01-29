/**
 @Entity() : Décore la classe comme une entité TypeORM.
 @PrimaryGeneratedColumn() : Indique une colonne primaire auto-générée,
 souvent utilisée pour l'identifiant.
 @Column() : Décore chaque propriété que vous souhaitez stocker dans la
 base de données.
 L'option unique: true assure que la valeur est unique dans la colonne.

*! la structure de l'entité doit correspondre à la structure de la table 
*! dans la base de données.

 Utilisée par TypeORM pour interagir avec votre base de données, permettant
 des opérations comme la création, la lecture, la mise à jour et la
 suppression (CRUD) des utilisateurs.
 */

import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Friend } from './friend.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  login: string;

  @Column({ length: 42 })
  username: string;

  @Column({ nullable: true })
  picture: string;

  @Column({ default: 0 })
  won: number;

  @Column({ default: 0 })
  lost: number;

  @Column({ default: 0 })
  rank: number;

  @OneToMany(() => Friend, (friend) => friend.friend)
  friends: Friend[];
}
