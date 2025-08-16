import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .then(appRef => {
    // Prefer finishing splash once Angular is stable (first change detection pass done)
    try {
      // appRef may be an ApplicationRef
      const anyRef: any = appRef as any;
      if (anyRef && anyRef.isStable && anyRef.isStable.subscribe) {
        const sub = anyRef.isStable.subscribe((stable: boolean) => {
          if (stable) {
            (window as any).finishSplash?.();
            sub.unsubscribe?.();
          }
        });
      } else {
        // Fallback after a short delay
        setTimeout(() => (window as any).finishSplash?.(), 300);
      }
    } catch {
      setTimeout(() => (window as any).finishSplash?.(), 300);
    }
  })
  .catch((err) => console.error(err));