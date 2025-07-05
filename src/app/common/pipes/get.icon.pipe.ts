import { Pipe, PipeTransform } from '@angular/core';
import {
    BookUserIcon,
    CogIcon,
    UserIcon,
    ShieldIcon,
    StoreIcon,
    FileTextIcon,
    BuildingIcon,
    BarChart3Icon,
    HandCoinsIcon,
    LayoutIcon
} from 'lucide-angular';


@Pipe({
    name: 'getIcon',
    standalone: true
})
export class GetIconPipe implements PipeTransform {
    private iconMap: { [key: string]: any } = {
        'book-user': BookUserIcon,
        'cog': CogIcon,
        'user': UserIcon,
        'shield': ShieldIcon,
        'store': StoreIcon,
        'file-text': FileTextIcon,
        'building': BuildingIcon,
        'bar-chart-3': BarChart3Icon,
        'hand-coins': HandCoinsIcon,
        'layout': LayoutIcon,
    };

    transform(iconName: string): any {
        return this.iconMap[iconName] || UserIcon; // fallback to UserIcon
    }
}