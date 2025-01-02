import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { AppComponent } from './app.component';
import { AuthService } from './services/auth.service';
import { Subject } from 'rxjs';

describe('AppComponent', () => {
  beforeEach(async () => {
    const authServiceMock = {
    };

    const httpClientMock = {
    };

    const routerMock = {
      navigate: jest.fn(),
      events: new Subject()
    } as any;

    const activatedRouteMock = {} as any;

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: HttpClient, useValue: httpClientMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
