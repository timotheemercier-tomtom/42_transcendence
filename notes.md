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


  ## USER IMAGE

    const supabaseUrl = this.configService.get('SUPABASE_URL');
    const supabaseKey = this.configService.get('SUPABASE_KEY');

    this.supabaseClient = createClient(supabaseUrl, supabaseKey);

  async uploadImage(file: Express.Multer.File): Promise<string> {
    const { data, error } = await supabase.storage
      .from('user-images')
      .upload(`path/to/store/${file.originalname}`, file.buffer, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw new Error('Error uploading to Supabase');
    }

    return `your-supabase-url/storage/v1/object/public/${data.Key}`;
  }

  async updateImage(username: string, imageUrl: string): Promise<User> {
    const user = await this.usersRepository.findOneBy({ username });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.picture = imageUrl;
    return this.usersRepository.save(user);
  }

    @Post('upload/:login')
  @UseInterceptors(FileInterceptor('file'))
  async uploadUserImage(
    @UploadedFile() file: Express.Multer.File,
    @Param('login') login: string,
  ) {
    const imageUrl = await this.userService.uploadImage(file);
    return this.userService.updateImage(login, imageUrl);
  }
