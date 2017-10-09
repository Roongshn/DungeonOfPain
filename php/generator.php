<?
/*
I-столбцы
J строки

*/

    class level {
        public $width=150;
        public $height=150;

        private $map;     //сама карта
        private $scheme;   //схема уровня. вероятно скоро спилится
        private $player;
        private $clean_char = '';
        private $debug; //сюда класть всякую отладку
        private $monsters; //массив с монстрами
        private $monster_limit=3; //лимит монстров в комнате
        private $monster_prob=0; //вероятность спавна монстра на клетке комнаты

        function __construct() {
            if(!empty($_POST['max_room_size']))
            {
                $this->max_room_size=$_POST['max_room_size'];
                $this->min_room_size=$_POST['min_room_size'];
                $this->tort=$_POST['tortuosity'];
                $this->max_depth=$_POST['max_depth'];
                $this->corridor_prob_red=$_POST['probability_red'];
                $this->min_corridor_length=$_POST['min_corridor_length'];
                $this->max_corridor_length=$_POST['max_corridor_length'];
            } else {
                $this->max_room_size=10;
                $this->min_room_size=20;
                $this->tort=60;
                $this->max_depth=1;
                $this->corridor_prob_red=0;
                $this->min_corridor_length=10;
                $this->max_corridor_length=15;
            }
            $this->corridor_prob=100;
        }

        public function pregenerate() {
            for($i=0;$i<$this->height; $i++){
                for($j=0;$j<$this->width; $j++){
                    $this->map[$i][$j]['type']= $this->clean_char;
                }
            }
        }

        private function filter_doors() {
            //убивание лишних дверей

            for($i=0;$i<$this->height; $i++){
                for($j=0;$j<$this->width; $j++){
                    if(
                        $this->map[$i][$j]['type'] == 'D' && (
                            !(
                                (($this->map[$i+1][$j]['type']=='F' && $this->map[$i-1][$j]['type']=='F' ) && ($this->map[$i][$j+1]['type']!=='F' && $this->map[$i][$j-1]['type']!=='F' )) ||
                                (($this->map[$i+1][$j]['type']!=='F' && $this->map[$i-1][$j]['type']!=='F' ) && ($this->map[$i][$j+1]['type']=='F' && $this->map[$i][$j-1]['type']=='F' ))
                            ) ||
                            $this->get_cell_surround_num($i,$j, 'D') > 0
                        )
                    )
                    {
                        $this->map[$i][$j]['type'] = 'F';
                    }
                }
            }
        }

        private function filter_corridors() {
            //убивание тупиков
            do {
                $deadedns = 0;
                for($i=0;$i<$this->height; $i++){
                    for($j=0;$j<$this->width; $j++){
                        if(($this->map[$i][$j]['type'] == 'F' ) //t
                           &&
                           (
                                ( ($this->get_cell_cross_surround_num($i,$j, 'F') <= 1) && ($this->get_cell_cross_surround_num($i,$j, 'D') == 0) ) ||
                                ( ($this->get_cell_cross_surround_num($i,$j, 'F') == 0) && ($this->get_cell_cross_surround_num($i,$j, 'D') == 1) )
                           )
                        )
                        {
                            $this->map[$i][$j]['type']= $this->clean_char;
                            $deadedns++;
                        }
                    }
                }
            } while($deadedns > 0);
        }


        public function postgenerate() {

            for($i=0; $i<3;$i++)
            {
                $this->filter_corridors();
                 $this->filter_doors();
            }

            for($i=0;$i<$this->height; $i++){
                for($j=0;$j<$this->width; $j++){

                    //рисуем стены
                    //пусть стена будет 0
                    //если клетка пустая и в её окрестности есть непустая клетка, которая пол-заполняем
                    if($this->map[$i][$j]['type'] == $this->clean_char && $this->get_cell_surround_num($i,$j,'F') > 0 )
                    {
                       $this->map[$i][$j]['type'] = 'WL';
                    }
                }
            }


            for($i=0;$i<$this->height; $i++){
                for($j=0;$j<$this->width; $j++){
                    //настраиваем прозрачности
                    if($this->map[$i][$j]['type'] == 'WL' || $this->map[$i][$j]['type'] == 'D')
                        $this->map[$i][$j]['transparent'] = false;
                    //разбавляем текстуры
                    if($this->map[$i][$j]['type'] == 'WL' && rand(0,3) == 0) {
                        $this->map[$i][$j]['tile'] = 1;
                    }
                    else {
                        $this->map[$i][$j]['tile'] = 0;
                    }
                }
            }

        }

        public function make_scheme() {
            for($i=0;$i<$this->height; $i++){
                for($j=0;$j<$this->width; $j++){
                    if($this->map[$i][$j]['type']!=='WL'){
                        $this->scheme[$i][$j] = 0;
                    }
                    else {
                        $this->scheme[$i][$j] = -1;
                    }

                }
            }
        }

        public function print_level() {
            foreach($this->map as $string) {
                foreach($string as $cell) {
                    if($cell['type']==$this->clean_char)
                        echo '&nbsp;';
                    else
                        echo $cell['type'];
                }
                echo '|<br>';
            }
        }


        public function return_level_json() {
            $result['map']=$this->map;
            $result['scheme']=$this->scheme;
            $result['player']=$this->player;
            $result['monsters']=$this->monsters;
            $result['debug']=$this->debug;
            echo json_encode($result);
        }

        private function get_opposite_direction($direction) {
            switch($direction) {
                case 0:
                    return 2;
                case 1:
                    return 3;
                case 2:
                    return 0;
                case 3:
                    return 1;
                case -1:
                    return -1;
            }
        }

        private function get_cell_surround_num($x, $y, $cell_type) {
            $num=0;
            for($i=-1;$i<=1;$i++)
            {
                for($j=-1;$j<=1;$j++)
                {
                    if($this->map[$x+$i][$y+$j]['type'] == $cell_type  && !($i == 0 && $j == 0) )
                    {
                        $num++;
                    }
                }

            }
            return $num;
        }

        private function get_cell_cross_surround_num($x, $y, $cell_type) {
            $num=0;
            if ($this->map[$x+1][$y]['type']==$cell_type)
            {
                $num++;
            }
            if ($this->map[$x-1][$y]['type']==$cell_type)
            {
                $num++;
            }
            if ($this->map[$x][$y+1]['type']==$cell_type)
            {
                $num++;
            }
            if ($this->map[$x][$y-1]['type']==$cell_type)
            {
                $num++;
            }
            return $num;
        }

        public function generate_corridor($start_i, $start_j,$vector, $depth){
            //выбираем направление
            /*  0 север
             *  1 запад
             *  2 юг
             *  3 восток
             *
             *  идем в нем
             *
             *  кидаем, не изменилось ли направление
             */
            //рандомная длина коридора
            $length=rand($this->min_corridor_length, $this->max_corridor_length);


            $cell=array('i'=>$start_i, 'j'=>$start_j);
            $direction = $vector;
            for($i=0; $i< $length; $i++) {
                switch($direction) {
                    case 0 :
                        $cell['i']-=1;
                        break;
                    case 1 :
                        $cell['j']+=1;
                        break;
                    case 2 :
                        $cell['i']+=1;
                        break;
                    case 3 :
                        $cell['j']-=1;
                        break;
                }
                if($cell['i'] < ($this->height-1) &&
                   $cell['j'] < ($this->width-1) &&
                   $cell['i'] >=1 &&
                   $cell['j'] >=1 &&
                   $this->map[$cell['i']][$cell['j']]['type'] == $this->clean_char
                ) {
                        if($i==$length-1) {
                            $n=rand($this->min_room_size,$this->max_room_size);
                            $m=rand($this->min_room_size,$this->max_room_size);
                            $this->generate_room($cell['i'], $cell['j'],$direction ,$n, $m, $depth);

                        }

                        if($i==0 || $i==$length-2 ) {
                            $this->map[$cell['i']][$cell['j']]['type'] = 'D';
                        }
                        else
                        {
                            $this->map[$cell['i']][$cell['j']]['type'] = 'F';
                        }
                }
                else {
                    break; //выходим если уперлись стену
                }

                if( rand(0,99) <= $this->tort && $i>1)
                {
                    do {
                        $new_direction = rand(0,3);
                    } while ($new_direction == $this->get_opposite_direction($direction) || $new_direction == $this->get_opposite_direction($vector));
                    $direction = $new_direction;
                }

            }
        }

        public function generate_room($entr_i, $entr_j, $direction, $n, $m, $depth){
            //n-высота
            //m-ширина

            /*
             *  вычисляем координаты углов, исходя из начальной клетки
             *  создаем комнату N x M
             *  в каждой стене случайное количество дверей, но не больше чем N/3
             *  для каждой двери запускаем generate_corridor
             */

            switch($direction) {
                case 0 ://север
                case -1 : //костыль для первой комнаты
                    $offset = rand(1,$m);
                    $start_i = $entr_i-$n+1;
                    $start_j = $entr_j-$offset+1;
                    break;
                case 1 :       //запад
                    $offset = rand(1,$n);
                    $start_i = $entr_i-$offset+1;
                    $start_j = $entr_j;
                    break;
                case 2 :       //юг
                    $offset = rand(1,$m);
                    $start_i = $entr_i;
                    $start_j = $entr_j-$offset+1;
                    break;
                case 3:       //восток
                    $offset = rand(1,$n);
                    $start_i = $entr_i-$offset+1;
                    $start_j = $entr_j-$m+1;
                    break;
                }



            //тут надо проверять, не ушли ли мы за границу уровня
            //надо-ну так и проверяем
            if($start_i < 1){
                $start_i = 1;
            }

            if($start_j < 1){
                $start_j = 1;
            }

            if($start_i+$n-1 > ($this->height-2)){
                $n = $this->height-$start_i-2;
            }

            if($start_j+$m-1 > ($this->width-2)){
                $m = $this->width-$start_j-2;
            }

            $mobs_in_room = 0;
            //генерим комнату
            for($i=0; $i<$n; $i++) {
                for($j=0; $j<$m; $j++) {
                    $this->map[$i+$start_i][$j+$start_j]['type']= 'F';

                    //пихаем мобьё
                    if($this->monster_limit > $this->mobs_in_room && rand(0,99) < 4 && $direction !==-1) {
                        $this->add_monster($i+$start_i,$j+$start_j);
                        $mobs_in_room++;
                    }
                }
            }

            if($direction == -1) {
                $x=round($start_i+($n/2));
                $y=round($start_j+($m/2));
                $this->add_player($x,$y);
            }

            //стены
            // [i j]        [i j+n]
            // [i j+n]      [i+m j+n]
            // [i+m j+n]    [i+m j]
            // [i+m j]      [i j]
            // новые коридоры
            //пока по одному
            if($depth < $this->max_depth) {
                $depth++;
                if(rand(0,99) <= $this->corridor_prob && $this->get_opposite_direction($direction) != 0)
                {
                    $door=rand(1,$m)-1; //северная стена
                    $this->generate_corridor($start_i,$start_j+$door,0,$depth);
                }
                if(rand(0,99) <= $this->corridor_prob && $this->get_opposite_direction($direction) != 1)
                {
                    $door=rand(1,$n)-1; //западная стена
                    $this->generate_corridor($start_i+$door,$start_j+$m-1,1,$depth);
                }
                if(rand(0,99) <= $this->corridor_prob && $this->get_opposite_direction($direction) != 2 )
                {
                    $door=rand(1,$m)-1; //южная стена
                    $this->generate_corridor($start_i+$n-1,$start_j+$door,2,$depth);
                }
                if(rand(0,99) <= $this->corridor_prob && $this->get_opposite_direction($direction) != 3)
                {
                    $door=rand(1,$n)-1; //восточная стена
                    $this->generate_corridor($start_i+$door,$start_j,3,$depth);
                }
                $this->corrodor_prob -= $this->corrodor_prob_red;
            }

        }



        public function add_player($x,$y) {
            $this->player['position']['x']=$x;
            $this->player['position']['y']=$y;

            $this->player['hp']=20;
            $this->player['max_hp']=20;

            $this->player['min_damage']=2;
            $this->player['max_damage']=4;
            $this->player['armor']=6;
            $this->player['strength']=3;
            $this->player['speed']=15;
            $this->player['vision_range']=5;
            $this->player['duration']=0;

            $this->map[$x][$y]['charaster'] = 999;
        }

        private function add_monster($x,$y) {
            //тут всякий рассчет, какого моба спавнить

            //кладем моба в массив мобов
            $this->monsters[]=[
                               'id'=>'mob_goblin',
                               'name'=>'Гоблин-солдат',
                               'position'=>['x'=>$x,
                                            'y'=>$y],
                                'dead'=>false,
                                'state'=>'sleep', //sleep, hunt, attack

                               'hp'=>10,
                               'max_hp'=>10,
                               'duration'=>0,
                               'min_damage'=>1,
                               'max_damage'=>3,
                               'armor'=>3,
                               'strength'=>2,
                               'speed'=>4,
                               ];
            //помечаем на карте
            $this->map[$x][$y]['charaster'] = count($this->monsters)-1;
        }

    }

    $level = new level;

    $level->pregenerate();

    $n=rand($level->min_room_size,$level->max_room_size);
    $m=rand($level->min_room_size,$level->max_room_size);

    $level->generate_room($level->height/2, $level->width/2, -1,  $n, $m, 0);
    $level->postgenerate();
    //$level->make_scheme();
    //$level->add_player($level->width/2, $level->height/2);
    //$level->add_player($level->height/2, $level->width/2);

    // $level->print_level();

    $level->return_level_json();

?>
