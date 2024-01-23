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

  /**
   * Post decorator represents method of request as we have used post decorator the method
   * of this API will be post.
   * so the API URL to create User will be
   * POST http://localhost:3000/user
   */
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  /**
   * we have used get decorator to get all the user's list
   * so the API URL will be
   * GET http://localhost:3000/user
   */
  @Get()
  findAll() {
    return this.userService.findAllUser();
  }

  /**
   * we have used get decorator with id param to get id from request
   * so the API URL will be
   * GET http://localhost:3000/user/:id
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.viewUser(+id);
  }

  /**
   * we have used patch decorator with id param to get id from request
   * so the API URL will be
   * PATCH http://localhost:3000/user/:id
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.updateUser(+id, updateUserDto);
  }


  // src/users/users.controller.ts
@Put('profile')
@UseGuards(AuthGuard('jwt'))
async updateProfile(@Req() req, @Body() updateProfileDto: UpdateProfileDto): Promise<User> {
    return this.userService.updateProfile(req.user.id, updateProfileDto);
}

// src/users/dto/update-profile.dto.ts
export class UpdateProfileDto {
    // define properties to be updated
    readonly name?: string;
    readonly email?: string;
    // ... other fields
}

// src/users/users.service.ts
async updateProfile(userId: number, updateProfileDto: UpdateProfileDto): Promise<User> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
        throw new NotFoundException('User not found');
    }

    // update the user properties
    Object.assign(user, updateProfileDto);
    
    // save the updated user
    return this.userRepository.save(user);
}
