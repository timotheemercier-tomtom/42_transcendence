### USER

```typescript
class User {
  id: number;
  username: string;
  login: string;
  picture: string;
}
```

* PROPERTIES 
`userRepository: Repository<User>`

* FIND USER BY USER NAME
`async findUser(username: string): Promise<User | null> `

* CREATE USER
`async createUser(userData: Partial<User>): Promise<User>`

* UPDATE USER 
`async updateUser(username: string, updateUserDto: UpdateUserDto): Promise<User>`
