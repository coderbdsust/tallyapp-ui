
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { DailyWorkCalendarEntry, MonthlyCalendar } from '../models/calendar.model';

@Injectable({
  providedIn: 'root'
})
export class DailyWorkCalendarService {
  private apiUrl = `${environment.tallyURL}/employee/daily-work/calendar/v1`;

  constructor(private http: HttpClient) {}

  getCurrentMonthCalendar(organizationId: string): Observable<MonthlyCalendar> {
    const params = new HttpParams().set('organizationId', organizationId);
    return this.http.get<MonthlyCalendar>(`${this.apiUrl}/current-month`, { params });
  }

  getMonthlyCalendar(organizationId: string, year: number, month: number): Observable<MonthlyCalendar> {
    const params = new HttpParams()
      .set('organizationId', organizationId)
      .set('year', year.toString())
      .set('month', month.toString());
    return this.http.get<MonthlyCalendar>(`${this.apiUrl}/month`, { params });
  }

  getCalendarEntryForDate(organizationId: string, date: string): Observable<DailyWorkCalendarEntry> {
    const params = new HttpParams()
      .set('organizationId', organizationId)
      .set('date', date);
    return this.http.get<DailyWorkCalendarEntry>(`${this.apiUrl}/date`, { params });
  }

  getCalendarEntriesForDateRange(
    organizationId: string, 
    fromDate: string, 
    toDate: string
  ): Observable<DailyWorkCalendarEntry[]> {
    const params = new HttpParams()
      .set('organizationId', organizationId)
      .set('fromDate', fromDate)
      .set('toDate', toDate);
    return this.http.get<DailyWorkCalendarEntry[]>(`${this.apiUrl}/date-range`, { params });
  }
}