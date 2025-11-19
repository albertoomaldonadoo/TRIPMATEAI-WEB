import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateContactsComponent } from './update-contacts.component';

describe('UpdateContactsComponent', () => {
  let component: UpdateContactsComponent;
  let fixture: ComponentFixture<UpdateContactsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateContactsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateContactsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
