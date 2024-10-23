import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { DetailsTBComponent } from './details-tb.component'

describe('DetailsTBComponent', () => {
    let component: DetailsTBComponent
    let fixture: ComponentFixture<DetailsTBComponent>

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [DetailsTBComponent],
        }).compileComponents()
    }))

    beforeEach(() => {
        fixture = TestBed.createComponent(DetailsTBComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
