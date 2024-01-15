## STEPS

### Step 1: Setting Up the Project
1. **Create the Project Folder**:
   - Open VSCode.
   - Create a new folder named "Pong".

2. **Initialize the Project with Yarn**:
   - Open a terminal in VSCode.
   - Run `yarn init -y` to initialize a new project. This creates a `package.json` file.

### Step 2: Setting Up the Backend with NestJS
1. **Install NestJS CLI**:
   - Run `yarn global add @nestjs/cli` to install NestJS CLI.

2. **Create a NestJS App**:
   - In the terminal, run `nest new backend` to create a new NestJS application in a `backend` folder.

3. **Install TypeORM and Database Driver**:
   - Inside the `backend` folder, install TypeORM and the database driver (e.g., PostgreSQL): `yarn add @nestjs/typeorm typeorm pg`.

### Step 3: Setting Up the Frontend with React and Material UI
1. **Create a React App with Vite**:
   - In the main project folder, run `yarn create vite frontend --template react-ts` to create a new React application using TypeScript in a `frontend` folder.

2. **Install Material UI**:
   - Inside the `frontend` folder, run `yarn add @mui/material @emotion/react @emotion/styled`.

### Step 4: Structuring the Project
1. **Backend Structure**:
   - Organize your NestJS backend by feature. Each feature should have its module, controller, and service.

2. **Frontend Structure**:
   - Structure your React application by components and pages. Use Material UI components for UI elements.

## STRUCTURE

1. **Root Directory** (`backend/`)
   - `src/`
     - `modules/` : Chaque module représente une fonctionnalité distincte.
       - `auth/` : Authentification.
         - `auth.module.ts`
         - `auth.controller.ts`
         - `auth.service.ts`
       - `user/` : Gestion des utilisateurs.
         - `user.module.ts`
         - `user.controller.ts`
         - `user.service.ts`
       - `game/` : Logique du jeu.
         - `game.module.ts`
         - `game.controller.ts`
         - `game.service.ts`
     - `entities/` : Modèles de données.
     - `middleware/` : Middlewares personnalisés.
     - `interceptors/` : Interceptors.
     - `main.ts` : Fichier principal.

2. **Autres Dossiers**
   - `config/` : Configuration.
   - `utils/` : Fonctions utilitaires.


### Backend Structure with NestJS

NestJS CLI provides commands to create modules, controllers, and services, which can help organize your code.

1. **Create Folders and Files**:
   - You should manually create folders for entities, middleware, and interceptors.

2. **Using NestJS CLI**:
   - For each module (Auth, User, Game), you can use the command `nest g module <module_name>`.
   - Similarly, use `nest g controller <controller_name>` and `nest g service <service_name>` for controllers and services, respectively.
   - These commands will create the respective files and update the module files with necessary imports.

### Frontend Structure with React

React doesn't have a CLI like NestJS for scaffolding, so you'll mostly create folders and files manually.

1. **Create Directories**:
   - Manually create directories for components, pages, services/API calls, utilities/helpers, and state management within your `src` folder.

2. **Create React Components**:
   - Use your IDE or text editor to create new files for your components (e.g., `Header.js`, `Home.js`).

3. **React Router**:
   - Set up routing by installing React Router (`yarn add react-router-dom`) and configuring your routes in `App.js` or a dedicated routing file.

4. **State Management**:
   - If you choose to use Redux, you can use Redux Toolkit (`@reduxjs/toolkit`), which simplifies setting up the Redux store and writing reducers and actions.

### User Step by Step

Pour récupérer et sauvegarder les données de profil utilisateur via l'API 42 en utilisant TypeScript et Passport dans une application NestJS, tu suivras ces étapes :
Étape 1 : Configurer Passport pour l'Authentification OAuth

    Configurer un Stratégie Passport :
        Crée une stratégie Passport personnalisée pour l'authentification OAuth avec l'API 42.
        Utilise le package passport-42 pour faciliter l'implémentation.

Étape 2 : Créer un Endpoint pour l'Authentification

    Endpoint d'Authentification :
        Crée un endpoint dans ton AuthController qui déclenche le processus d'authentification OAuth avec l'API 42.

Étape 3 : Récupérer les Données Utilisateur

    Endpoint Callback :
        Dans AuthController, ajoute un endpoint de callback pour OAuth.
        Dans ce callback, utilise la stratégie Passport pour récupérer les données utilisateur de l'API 42.

Étape 4 : Sauvegarder les Données dans la Base de Données

    Service Utilisateur :
        Utilise UserService pour sauvegarder les informations récupérées dans ta base de données.

```typescript
// auth.controller.ts
@Controller('auth')
export class AuthController {
  constructor(private readonly userService: UserService) {}

  @Get('42')
  @UseGuards(AuthGuard('42'))
  signInWith42() {
    // déclenche l'authentification avec l'API 42
  }

  @Get('42/callback')
  @UseGuards(AuthGuard('42'))
  async fortyTwoAuthRedirect(@Req() req: Request, @Res() res: Response) {
    const userData = req.user; // données de l'utilisateur retournées par l'API 42
    await this.userService.createUser(userData);
    res.redirect('/profile');
  }
}

// user.service.ts
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createUser(userData: any): Promise<User> {
    // Logique pour créer ou mettre à jour l'utilisateur dans la base de données
    // Inclut la sauvegarde de l'URL de la photo de profil et d'autres données
  }
}
```

### Décorateurs Typescript / NestJS
_Les décorateurs sont un élément central de NestJS et TypeScript, offrant une manière élégante de déclarer et de modifier le comportement des différentes parties d'une application._
_Ce sont de expressions spéciales qui permettent d'annoter et de modifier les classes et les propriétés au moment de la définition_

    @Controller(): Définit une classe comme contrôleur dans NestJS, avec des routes pour gérer les requêtes HTTP.

    @Get(), @Post(): Définit des méthodes pour gérer les requêtes GET ou POST sur une route spécifique.

    @Injectable(): Indique qu'une classe peut être injectée comme dépendance dans d'autres classes.

