import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('../../views/home/home-routing').then(m => m.routes),
  },
  {
    path: 'sets',
    loadChildren: () => import('../../views/sets/sets-routing').then(m => m.routes),
  },
  {
    path: 'cards',
    loadChildren: () => import('../../views/cards/cards-routing').then(m => m.routes),
  },
  {
    path: 'news',
    loadChildren: () => import('../../views/news/news-routing').then(m => m.routes),
  },
  {
    path: 'decks',
    loadChildren: () => import('../../views/decks/decks-routing').then(m => m.routes),
  },
  {
    path:'banlist',
    children:[
      {
        path: 'tcg',
        loadChildren: () => import('../../views/banlists/banlist-routing').then(m => m.routes),
        data:{ route: 'tcg' }
      },
      {
        path: 'ocg',
        loadChildren: () => import('../../views/banlists/banlist-routing').then(m => m.routes),
        data:{ route: 'ocg' }
      },
      {
        path: '**',
        redirectTo: '/home',
      }
    ]
  },
  {
    path: 'tournament',
    loadChildren: () => import('../../views/tournament/tournament-routing').then(m => m.routes),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'home',
  }
];

