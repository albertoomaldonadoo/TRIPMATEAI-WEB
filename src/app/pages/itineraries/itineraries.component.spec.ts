import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItinerariesComponent } from './itineraries.component';

describe('ItinerariesComponent', () => {
  let component: ItinerariesComponent;
  let fixture: ComponentFixture<ItinerariesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItinerariesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ItinerariesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
