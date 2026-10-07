"""Measure peak RAM when loading the demo corpus."""
import gc
import os
import tracemalloc

os.environ["MX_DATA_DIR"] = "data/mx_demo"
os.environ["MX_CORPUS_DIR"] = "corpus_demo"
os.environ["OUT_DIR"] = "out_demo"

tracemalloc.start()
from mx import data as mx_data  # noqa: E402

mx_data.current.cache_clear()
import mx.sources as src

src._TEXT_CACHE.clear()

d = mx_data.load()
gc.collect()
cur, peak = tracemalloc.get_traced_memory()
tracemalloc.stop()

print(f"RAM after load+gc : {cur/1024/1024:.1f} MB")
print(f"RAM peak during load: {peak/1024/1024:.1f} MB")
print(f"Verified reqs       : {len(d.verified)}")
print(f"Zones loaded        : {len(d.zones.states) if d.zones else 'ERROR: ' + str(d.zones_error)}")
print("OK" if peak / 1024 / 1024 < 400 else "WARNING: peak > 400 MB")
