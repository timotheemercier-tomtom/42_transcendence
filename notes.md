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


import { User } from "./entity/User"

const userRepository = dataSource.getRepository(User)
const user = await userRepository.findOneBy({
    id: 1,
})
user.name = "Umed"
await userRepository.save(user)


import { Photo } from "./entity/Photo"
import { AppDataSource } from "./index"

const photo = new Photo()
photo.name = "Me and Bears"
photo.description = "I am near polar bears"
photo.filename = "photo-with-bears.jpg"
photo.views = 1
photo.isPublished = true

const photoRepository = AppDataSource.getRepository(Photo)

await photoRepository.save(photo)
console.log("Photo has been saved")

const savedPhotos = await photoRepository.find()
console.log("All photos from the db: ", savedPhotos)




const userRepository = MyDataSource.getRepository(User)

const user = new User()
user.firstName = "Timber"
user.lastName = "Saw"
user.age = 25
await userRepository.save(user)

const allUsers = await userRepository.find()
const firstUser = await userRepository.findOneBy({
    id: 1,
}) // find by id
const timber = await userRepository.findOneBy({
    firstName: "Timber",
    lastName: "Saw",
}) // find by firstName and lastName

await userRepository.remove(timber)





@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findOne(id: number): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }
}