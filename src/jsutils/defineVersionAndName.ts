import { originModule } from '../version';

/**
 * Adds this package's origin module descriptor to the ORIGIN_MODULE field of `object`.
 */
export default function defineOriginModule(object: any): void {
  object.ORIGIN_MODULE = originModule;
}
