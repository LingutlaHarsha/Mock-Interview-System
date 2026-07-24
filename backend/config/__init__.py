# Python 3.14 Compatibility Patch for Django Template Context Copying
import django.template.context as dtc

def _patched_basecontext_copy(self):
    obj = self.__class__.__new__(self.__class__)
    obj.__dict__.update(self.__dict__)
    obj.dicts = self.dicts[:]
    return obj

dtc.BaseContext.__copy__ = _patched_basecontext_copy
