//locate2d.h

#pragma once
#include <opencv2/core/core.hpp>  
#include <opencv2/highgui/highgui.hpp>  
#include <opencv2/imgproc/imgproc.hpp>  
#include <opencv2/xfeatures2d.hpp>
#include <stdio.h>

using namespace std;
using namespace cv;

//ȫ�ֱ�������-----------------------------------
Mat src, temp, gray, binary, border, abs_border;
int thresh = 30;//�ǵ�����ֵ  
int max_thresh = 175;//�ǵ��������ֵ  
int thresh_bi = 128;//��ֵͼ��ֵ
int max_thresh_bi = 255;//��ֵͼ�����ֵ
int offset = 15;//��̬ѧ����ƫ����
int key = 0;;//������ֵ
int x_1, y_1, count_1, theta_1;//ͼ��1�����λ�á�����
int x_2, y_2, count_2, theta_2;//ͼ��2�����λ�á�����
//-----------------------------------------------

//ͼ�����뺯��-----------------------------------
int loadimg();
//-----------------------------------------------

//�ص�����---------------------------------------
void on_detect(int, void *);
//-----------------------------------------------

//ͼ��Ԥ��������---------------------------------
void preproc();
//-----------------------------------------------

//��ѯ��ȡ��ֵ����-------------------------------
int getkey();
//-----------------------------------------------

//�����λ����-----------------------------------
void locate2d();
//-----------------------------------------------

//��������ͼ����-------------------------------
void restart();
//-----------------------------------------------

//��ʾ�ı���ʾ����-------------------------------
void helptext();
//-----------------------------------------------