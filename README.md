# ompthebestthing

A tiny CLI that ships nine OpenMP / MPI lab programs and lets you view or save them anywhere you have Node.js.

## Usage

No install needed:

```sh
npx ompthebestthing list               # list all programs
npx ompthebestthing show 3             # print prg3.c to the terminal
npx ompthebestthing get prg1 prg5      # save prg1.c and prg5.c in the current directory
npx ompthebestthing get all -d lab     # save all programs into ./lab
```

Or install it globally once and drop the `npx`:

```sh
npm install -g ompthebestthing
ompthebestthing get all
```

Running straight from GitHub (no npm publish needed):

```sh
npx github:ara-aras/npm_test list
```

## Programs

| Name | Type | Topic | Build & run |
|------|------|-------|-------------|
| prg1 | OpenMP | Sequential vs parallel merge sort | `gcc -fopenmp prg1.c -o prg1 && ./prg1` |
| prg2 | OpenMP | `schedule(static,2)` iteration split | `gcc -fopenmp prg2.c -o prg2 && ./prg2` |
| prg3 | OpenMP | Fibonacci with tasks | `gcc -fopenmp prg3.c -o prg3 && ./prg3` |
| prg4 | OpenMP | Primes, serial vs parallel | `gcc -fopenmp prg4.c -o prg4 -lm && ./prg4` |
| prg5 | MPI | Send / Recv | `mpicc prg5.c -o prg5 && mpirun -np 2 ./prg5` |
| prg6 | MPI | Deadlock and avoidance | `mpicc prg6.c -o prg6 && mpirun -np 2 ./prg6` |
| prg7 | MPI | Bcast | `mpicc prg7.c -o prg7 && mpirun -np 4 ./prg7` |
| prg8 | MPI | Scatter / Gather | `mpicc prg8.c -o prg8 && mpirun -np 4 ./prg8` |
| prg9 | MPI | Reduce / Allreduce | `mpicc prg9.c -o prg9 && mpirun -np 4 ./prg9` |

## Adding a program

1. Drop the `.c` file into `programs/`.
2. Add an entry for it in the `CATALOG` object in `bin/ompthebestthing.js`.
3. Bump `version` in `package.json` and run `npm publish`.

## Publishing

```sh
npm login
npm publish
```
