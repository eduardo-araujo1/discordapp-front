import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { HomeComponent } from './home.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let router: jest.Mocked<Router>;

  beforeEach(() => {
    router = {
      navigate: jest.fn()
    } as any;

    TestBed.configureTestingModule({
      imports: [MatCardModule, MatButtonModule, HomeComponent],
      providers: [
        { provide: Router, useValue: router } 
      ]
    });

    component = TestBed.createComponent(HomeComponent).componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to /login when tryNow is called', () => {
    component.tryNow();

    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
